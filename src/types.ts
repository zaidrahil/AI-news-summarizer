export interface Article {
  url: string;
  title: string;
  content: string;
  source?: string;
  image?: string;
  author?: string;
  publishedDate?: string;
}

export interface SummaryResult {
  id: string;
  timestamp: string;
  articles: Article[];
  summaries: Record<string, string>; // language -> summary
  translatedHeadlines?: Record<string, string>; // language -> headline
  translatedHighlights?: Record<string, string[]>; // language -> highlights[]
  individualReports?: Record<number, Record<string, { headline: string; summary: string; highlights: string[] }>>; // articleIndex -> language -> report
  pivotSummary?: string;
  topics: string[];
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  highlights: string[];
}

export const LANGUAGE_OPTIONS = {
  "Telugu (te)": "Telugu",
  "Hindi (hi)": "Hindi",
  "Urdu (ur)": "Urdu",
  "English (en)": "English",
};

export type LanguageKey = keyof typeof LANGUAGE_OPTIONS;
