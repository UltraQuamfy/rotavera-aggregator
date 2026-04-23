import { Router } from "express";
import { parseA2AUASQuery } from "../services/a2auas";
import { federatedSearch } from "../services/federatedSearch";
import type { SearchQuery } from "../types";

const router = Router();

router.post("/search", async (req, res) => {
  try {
    const body = req.body as
      | ({
          query?: string;
          naturalLanguage?: string;
        } & Partial<SearchQuery>)
      | undefined;

    let searchQuery: SearchQuery;

    if (body?.naturalLanguage) {
      searchQuery = await parseA2AUASQuery({
        naturalLanguage: body.naturalLanguage,
      });
    } else {
      searchQuery = {
        query: body?.query || "",
        category: body?.category,
        minPrice: body?.minPrice,
        maxPrice: body?.maxPrice,
        limit: body?.limit,
      };
    }

    if (!searchQuery.query.trim()) {
      res.status(400).json({
        success: false,
        error: "Query is required",
      });
      return;
    }

    const results = await federatedSearch(searchQuery);

    res.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error("[SEARCH] Error:", error);
    res.status(500).json({
      success: false,
      error: "Search failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
