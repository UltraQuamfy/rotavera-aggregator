import type { A2AUASQuery, SearchQuery } from "../types";

/**
 * A2AUAS: Automated Agent to Agent Universal Authorization Schema
 *
 * Translates natural language queries into structured search parameters.
 * In production: Calls Claude API to parse intent.
 * For POC: Simple keyword extraction.
 */
export async function parseA2AUASQuery(input: A2AUASQuery): Promise<SearchQuery> {
  const { naturalLanguage } = input;

  console.log(`[A2AUAS] Parsing: "${naturalLanguage}"`);

  const query: SearchQuery = {
    query: extractMainQuery(naturalLanguage),
  };

  const categories = [
    "coffee",
    "wine",
    "books",
    "electronics",
    "clothing",
    "beauty",
  ];
  for (const cat of categories) {
    if (naturalLanguage.toLowerCase().includes(cat)) {
      query.category = cat;
      break;
    }
  }

  const priceMatch = naturalLanguage.match(/under\s+\$?(\d+)/i);
  if (priceMatch) {
    query.maxPrice = parseInt(priceMatch[1], 10);
  }

  console.log("[A2AUAS] Structured query:", query);

  return query;
}

function extractMainQuery(text: string): string {
  const stopwords = [
    "find",
    "me",
    "some",
    "get",
    "buy",
    "show",
    "under",
    "over",
    "about",
    "around",
  ];

  let cleaned = text.toLowerCase();
  stopwords.forEach((word) => {
    cleaned = cleaned.replace(new RegExp(`\\b${word}\\b`, "g"), "");
  });

  cleaned = cleaned.replace(/\$?\d+/g, "");
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned || text.trim();
}
