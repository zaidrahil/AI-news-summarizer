import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

function cleanJsonResponse(text: string): string {
  // 1. Remove obvious markdown code blocks
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```/, "").replace(/```$/, "");
  }
  
  // 2. Search for the actual JSON boundaries to ignore trailing text
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  return cleaned.trim();
}

export async function summarizeArticles(
  articles: { title: string; content: string }[],
  targetLanguages: string[]
) {
  const model = "gemini-3-flash-preview";
  
  const articlesText = articles
    .map((a, i) => `Article ${i}: ${a.title}\n\n${a.content}`)
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
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    try {
      return JSON.parse(cleanJsonResponse(text));
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON. Raw text:", text);
      // Fallback: try to just trim and parse if extraction failed
      return JSON.parse(text.trim());
    }
  } catch (error) {
    console.error("Gemini summarization error:", error);
    throw error;
  }
}

export async function translateText(text: string, targetLanguage: string, originalHeadline: string) {
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
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const translatedJson = response.text;
    if (!translatedJson) throw new Error("No response from Gemini during translation");
    
    try {
      return JSON.parse(cleanJsonResponse(translatedJson)) as { headline: string; summary: string; highlights: string[] };
    } catch (parseError) {
      console.error("Failed to parse Gemini Translation JSON. Raw text:", translatedJson);
      return JSON.parse(translatedJson.trim());
    }
  } catch (error) {
    console.error("Gemini translation error:", error);
    throw error;
  }
}
