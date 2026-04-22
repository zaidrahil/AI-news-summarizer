import axios from "axios";

const API_TIMEOUT_MS = 45000;

const toFriendlyError = (error: unknown, action: "summarize" | "translate") => {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return new Error("Request timed out. Please try again.");
    }

    const status = error.response?.status;
    if (status === 503) {
      return new Error("AI service is temporarily busy. Please try again in a moment.");
    }

    if (status === 429) {
      return new Error("Too many requests right now. Please wait a bit and retry.");
    }

    const responseMessage = (error.response?.data as { error?: string } | undefined)?.error;
    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return new Error(responseMessage);
    }

    if (error.message) {
      return new Error(error.message);
    }
  }

  return new Error(action === "summarize"
    ? "Unable to generate summary right now. Please try again."
    : "Unable to translate right now. Please try again.");
};

export async function summarizeArticles(
  articles: { title: string; content: string }[],
  targetLanguages: string[]
) {
  try {
    const response = await axios.post('/api/gemini/summarize', { articles, targetLanguages }, { timeout: API_TIMEOUT_MS });
    return response.data;
  } catch (error: unknown) {
    console.error("Gemini summarization error from backend:", error);
    throw toFriendlyError(error, "summarize");
  }
}

export async function translateText(text: string, targetLanguage: string, originalHeadline: string) {
  try {
    const response = await axios.post('/api/gemini/translate', { text, targetLanguage, originalHeadline }, { timeout: API_TIMEOUT_MS });
    return response.data as { headline: string; summary: string; highlights: string[] };
  } catch (error: unknown) {
    console.error("Gemini translation error from backend:", error);
    throw toFriendlyError(error, "translate");
  }
}
