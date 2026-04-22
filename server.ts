import * as dotenv from 'dotenv';
import path from "path"; // Moved path import to the top
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') }); // Load environment variables from .env.local file
import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import { rateLimit } from "express-rate-limit";
import bcrypt from "bcryptjs";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy for rate limiting behind Cloud Run/Nginx
  app.set("trust proxy", 1);

  app.use(express.json());

  const USERS_FILE = path.join(process.cwd(), "users.json");

  // Helper to read users
  const getUsers = () => {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([]));
      return [];
    }
    try {
      return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
    } catch (e) {
      return [];
    }
  };

  // Helper to save users
  const saveUsers = (users: any[]) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  };

  // Security: Rate Limiting (Basic Firewall Protection)
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply rate limiter specifically to auth routes
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Increased slightly to accommodate registration + login testing
    message: "Too many authentication attempts, please try again later",
  });

  // Initialize Gemini AI on the server-side
  console.log("Attempting to load GEMINI_API_KEY. Value (first 5 chars):", 
              process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) + '...' : 'UNDEFINED');
  if (!process.env.GEMINI_API_KEY) {
    console.error("CRITICAL: GEMINI_API_KEY is not set. Please check your .env file.");
  }
  const geminiAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // Helper to clean JSON response from Gemini
  const cleanJsonResponse = (text: string): string => {
    let cleaned = text.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```/, "").replace(/```$/, "");
    }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    return cleaned.trim();
  };

  const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
  const GEMINI_MAX_RETRIES = 3;
  const GEMINI_REQUEST_TIMEOUT_MS = 30000;
  const GEMINI_BASE_DELAY_MS = 700;

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getGeminiErrorStatus = (error: any): number | undefined => {
    if (typeof error?.status === "number") return error.status;
    if (typeof error?.response?.status === "number") return error.response.status;
    return undefined;
  };

  const isRetryableGeminiError = (error: any): boolean => {
    const status = getGeminiErrorStatus(error);
    if (status && RETRYABLE_STATUS_CODES.has(status)) {
      return true;
    }

    const message = String(error?.message || "").toLowerCase();
    const code = String(error?.code || "").toLowerCase();
    const causeCode = String(error?.cause?.code || "").toLowerCase();
    const combined = `${message} ${code} ${causeCode}`;

    return (
      combined.includes("econnreset") ||
      combined.includes("etimedout") ||
      combined.includes("und_err_socket") ||
      combined.includes("fetch failed") ||
      combined.includes("socket") ||
      combined.includes("timeout")
    );
  };

  const callGeminiWithRetry = async (model: string, prompt: string) => {
    let lastError: any;

    for (let attempt = 1; attempt <= GEMINI_MAX_RETRIES; attempt++) {
      try {
        const response = await Promise.race([
          geminiAi.models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: "application/json" },
          }),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error("request timed out(or) Network issue ")), GEMINI_REQUEST_TIMEOUT_MS);
          }),
        ]);

        return response;
      } catch (error: any) {
        lastError = error;
        if (!isRetryableGeminiError(error) || attempt === GEMINI_MAX_RETRIES) {
          throw error;
        }

        const backoffMs = GEMINI_BASE_DELAY_MS * Math.pow(2, attempt - 1);
        await sleep(backoffMs);
      }
    }

    throw lastError;
  };

  // API Route for Registration
  app.post("/api/register", authLimiter, async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
      const usersData = getUsers();
      
      if (usersData.find((u: any) => u.email === email)) {
        return res.status(400).json({ error: "Account already exists with this email" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        username,
        email,
        password: hashedPassword
      };

      usersData.push(newUser);
      saveUsers(usersData);

      res.status(201).json({ success: true, user: { username: newUser.username, email: newUser.email } });
    } catch (error) {
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  // API Route for Login
  app.post("/api/login", authLimiter, async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      const usersData = getUsers();
      const user = usersData.find((u: any) => u.email === email);

      if (user) {
        // Handle both plain text (legacy/migration) and hashed passwords
        let isMatch = false;
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
          isMatch = await bcrypt.compare(password, user.password);
        } else {
          // Fallback for simple demo passwords previously set in plain text
          isMatch = password === user.password;
        }

        if (isMatch) {
          res.json({ success: true, user: { username: user.username, email: user.email } });
        } else {
          res.status(401).json({ error: "Invalid credentials" });
        }
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ error: "Database error" });
    }
  });

  // API Route for article extraction
  app.post("/api/extract", apiLimiter, async (req, res) => {
    let { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "URL is required and must be a string" });
    }

    // URL Sanitization
    url = url.trim();
    
    // Check if user accidentally pasted multiple URLs or extra text
    // Try to find the first valid-looking http(s) URL in the string
    // We handle cases where URLs are mashed together like: https://urlA.comhttps://urlB.com
    let urlMatches = url.match(/https?:\/\/[^\s]+/g);
    
    // If we have one match that looks like it contains ANOTHER http, split it
    if (urlMatches && urlMatches.length === 1) {
      const singleMatch = urlMatches[0];
      const secondaryHttpIndices = [...singleMatch.matchAll(/https?:\/\//g)].map(m => m.index);
      if (secondaryHttpIndices.length > 1) {
        // Take everything from first http to just before the second http
        url = singleMatch.substring(secondaryHttpIndices[0]!, secondaryHttpIndices[1]);
      } else {
        url = singleMatch;
      }
    } else if (urlMatches && urlMatches.length > 1) {
       // If multiple separate URLs detected, pick the first substantial one
       url = urlMatches.find(u => u.length > 15) || urlMatches[0];
    }

    // Final sanity check - if it doesn't look like a URL now, it's likely a bad paste
    if (!url.startsWith('http')) {
       return res.status(400).json({ error: "Invalid URL format. Please make sure the link starts with http:// or https://" });
    }

    try {
      // Validate with new URL() - this throws if invalid
      new URL(url);
    } catch (e) {
       return res.status(400).json({ error: "The provided link is not a valid URL structure.", url });
    }

    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
          "Sec-Ch-Ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
          "Sec-Ch-Ua-Mobile": "?0",
          "Sec-Ch-Ua-Platform": '"macOS"',
        },
        timeout: 15000,
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Remove unwanted tags
      $("script, style, noscript, nav, footer, header, ads, .ads, #ads").remove();

      const title = $("title").text().trim() || $("h1").first().text().trim();
      
      // Extraction of metadata
      let image = 
        $('meta[property="og:image"]').attr('content') || 
        $('meta[name="twitter:image"]').attr('content') || 
        $('link[rel="image_src"]').attr('href');
      
      // Normalize image URL
      if (image && !image.startsWith('http')) {
        try {
          const baseUrl = new URL(url);
          image = new URL(image, baseUrl.origin).href;
        } catch (e) {
          image = undefined;
        }
      }
      
      const source = 
        $('meta[property="og:site_name"]').attr('content') || 
        $('meta[name="application-name"]').attr('content') ||
        new URL(url).hostname.replace('www.', '');

      const author = 
        $('meta[name="author"]').attr('content') || 
        $('meta[property="article:author"]').attr('content') || 
        $('.author-name').first().text().trim();

      const publishedDate = 
        $('meta[property="article:published_time"]').attr('content') || 
        $('meta[name="pubdate"]').attr('content');

      // Content extraction logic similar to the Python version
      let content = "";
      const selectors = [
        "article",
        "main",
        "[role='main']",
        "#mw-content-text",
        ".article-body",
        ".article-content",
        ".post-content",
        ".entry-content",
        ".story-body",
        ".story-content",
        ".main-content"
      ];

      for (const selector of selectors) {
        const el = $(selector);
        if (el.length > 0) {
          // Get text but try to keep some structure
          content = el.find("p").map((i, p) => $(p).text().trim()).get().join("\n\n");
          if (content.length > 200) break;
          content = el.text().trim();
          if (content.length > 200) break;
        }
      }

      // Fallback to all paragraphs
      if (content.length < 200) {
        content = $("p").map((i, p) => $(p).text().trim()).get().filter(t => t.length > 20).join("\n\n");
      }

      if (!content) {
        throw new Error("Could not extract meaningful content");
      }

      res.json({ 
        title, 
        content: content.substring(0, 15000), 
        image, 
        source,
        author, 
        publishedDate 
      }); 
    } catch (error: any) {
      console.error("Extraction error:", url, error.message);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return res.status(error.response.status).json({ 
          error: `Source site returned error ${error.response.status}: ${error.response.statusText}`,
          url 
        });
      } else if (error.request) {
        // The request was made but no response was received
        return res.status(504).json({ error: "No response from the article source (timeout)", url });
      } else {
        // Something happened in setting up the request that triggered an Error
        return res.status(400).json({ error: error.message, url });
      }
    }
  });

  // API Route for Gemini Summarization
  app.post("/api/gemini/summarize", apiLimiter, async (req, res) => {
    const { articles, targetLanguages } = req.body;

    if (!articles || !Array.isArray(articles) || articles.length === 0 || !targetLanguages || !Array.isArray(targetLanguages)) {
      return res.status(400).json({ error: "Articles and target languages are required." });
    }

    const model = "gemini-3-flash-preview";
    const articlesText = articles
      .map((a: any, i: number) => `Article ${i}: ${a.title}\n\n${a.content}`)
      .join("\n\n---\n\n");

    const prompt = `
      You are a professional multilingual news processing AI.
      Your task is to accurately translate and summarize news articles while preserving meaning, clarity, and linguistic consistency.

      I will provide you with ${articles.length} news articles.
      
      INSTRUCTIONS:
      - For each article provided (Article 0, Article 1, etc.):
        - Generate a concise 1-2 paragraph summary in English first.
        - Extract 4-5 core key points in English.
      - MULTILINGUAL TRANSLATION (Strict Rules):
        - For each requested language: ${targetLanguages.join(", ")}:
          - Provide a natural translation of the headline.
          - Provide a very concise 1-paragraph summary.
          - Provide 3-4 high-impact key highlights for THAT article only.
      - DO NOT mix languages under any circumstances.
      - Proper nouns (e.g. person names) may remain unchanged.

      4. QUALITY VALIDATION:
      - Strictly no mixed-language output.
      - Every article MUST have an individual report entry.

      Articles:
      ${articlesText}
      
      Output format (JSON):
      {
        "topics": ["topic1", "topic2"],
        "sentiment": "Neutral/Positive/Negative",
        "individual_reports": {
          "0": {
            "English": { "headline": "...", "summary": "...", "highlights": ["..."] },
            "Telugu": { "headline": "...", "summary": "...", "highlights": ["..."] },
            "...": { "headline": "...", "summary": "...", "highlights": ["..."] }
          },
          "1": { ... }
        }
      }
    `;

    try {
      const response = await callGeminiWithRetry(model, prompt);
      const text = response.text;
      if (!text) throw new Error("No response from Gemini");
      res.json(JSON.parse(cleanJsonResponse(text)));
    } catch (error: any) {
      console.error("Gemini summarization error on server:", error);
      const statusCode = isRetryableGeminiError(error) ? 503 : (getGeminiErrorStatus(error) || 500);
      const message = statusCode === 503
        ? "AI service is temporarily unavailable. Please try again in a moment."
        : "Failed to get summary due to  network issue.";
      res.status(statusCode).json({ error: message, details: error.message });
    }
  });

  // API Route for Gemini Translation
  app.post("/api/gemini/translate", apiLimiter, async (req, res) => {
    const { text, targetLanguage, originalHeadline } = req.body;

    if (!text || !targetLanguage || !originalHeadline) {
      return res.status(400).json({ error: "Text, target language, and original headline are required for translation." });
    }

    const model = "gemini-3-flash-preview";
    const prompt = `
      You are a professional multilingual news processing AI.
      Your task is to accurately translate news articles while preserving meaning, clarity, and linguistic consistency.

      I will provide you with a news summary and its original headline.
      Translate them into ${targetLanguage}.
      
      INSTRUCTIONS:
      - HEADLINE: Translate the original headline completely. Do NOT shorten or summarize.
      - SUMMARY: Translate the summary text completely. Keep it punchy and concise.
      - KEY POINTS: Extract EXACTLY 4 to 5 core key points from the summary. Each point must be 12-15 words long in ${targetLanguage}.
      - DO NOT mix languages under any circumstances.
      - Preserve original meaning and tone exactly.
      
      STRICT QUALITY RULES:
      - No mixed-language output.
      - No preamble or extra text.
      - Validation Check: Is it fully translated? YES. Is any mixed language present? NO.
      
      Original Headline: ${originalHeadline}
      Text to translate: ${text}

      Output format (JSON):
      {
        "headline": "...",
        "summary": "...",
        "highlights": ["point 1", "point 2", "..."]
      }
    `;

    try {
      const response = await callGeminiWithRetry(model, prompt);
      const translatedJson = response.text;
      if (!translatedJson) throw new Error("No response from Gemini during translation");
      res.json(JSON.parse(cleanJsonResponse(translatedJson)));
    } catch (error: any) {
      console.error("Gemini translation error on server:", error);
      const statusCode = isRetryableGeminiError(error) ? 503 : (getGeminiErrorStatus(error) || 500);
      const message = statusCode === 503
        ? "AI service is temporarily unavailable. Please try again in a moment."
        : "Failed to get translation from AI service.";
      res.status(statusCode).json({ error: message, details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
