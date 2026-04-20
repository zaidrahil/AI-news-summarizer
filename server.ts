import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import { rateLimit } from "express-rate-limit";
import bcrypt from "bcryptjs";

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
