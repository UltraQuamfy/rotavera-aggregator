import type {
  FederatedSearchResult,
  Merchant,
  Product,
  SearchQuery,
} from "../types";
import { merchantRegistry } from "./merchantRegistry";

export async function federatedSearch(
  query: SearchQuery,
): Promise<FederatedSearchResult> {
  const startTime = Date.now();

  let merchants = merchantRegistry.getActive();
  if (query.category) {
    merchants = merchantRegistry.getByCategory(query.category);
  }

  console.log(
    `[FEDERATED_SEARCH] Searching ${merchants.length} merchants for: ${query.query}`,
  );

  const searchPromises = merchants.map((merchant) => searchMerchant(merchant, query));
  const results = await Promise.allSettled(searchPromises);

  const allProducts: Product[] = [];
  const merchantCounts: Record<string, { name: string; count: number }> = {};

  results.forEach((result, index) => {
    const merchant = merchants[index];
    if (result.status === "fulfilled" && result.value.products) {
      const products = applyPriceFilters(result.value.products, query);
      allProducts.push(...products);
      merchantCounts[merchant.id] = {
        name: merchant.name,
        count: products.length,
      };
    }
  });

  const sorted = allProducts.sort((a, b) => {
    if (a.inStock && !b.inStock) return -1;
    if (!a.inStock && b.inStock) return 1;
    return a.price - b.price;
  });

  const limited = sorted.slice(0, query.limit || 50);
  const searchTime = Date.now() - startTime;

  return {
    products: limited,
    merchants: Object.entries(merchantCounts).map(([id, data]) => ({
      id,
      name: data.name,
      count: data.count,
    })),
    totalResults: allProducts.length,
    searchTime,
    query,
  };
}

async function searchMerchant(
  merchant: Merchant,
  query: SearchQuery,
): Promise<{ products: Product[] }> {
  console.log(`[MERCHANT_SEARCH] ${merchant.name}: ${query.query}`);
  const baseUrl = process.env.PLATFORM_PRODUCTS_SEARCH_URL ?? "http://localhost:3000/api/products/search";

  try {
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchantId: merchant.id,
        query: query.query,
        category: query.category,
        maxPrice: query.maxPrice,
      }),
    });

    if (!res.ok) {
      console.warn(`[MERCHANT_SEARCH] ${merchant.name} API error: ${res.status}`);
      return { products: [] };
    }

    const data = (await res.json()) as { products?: Product[] };
    return { products: data.products ?? [] };
  } catch (error) {
    console.warn(`[MERCHANT_SEARCH] ${merchant.name} request failed:`, error);
    return { products: [] };
  }
}

function applyPriceFilters(products: Product[], query: SearchQuery): Product[] {
  return products.filter((product) => {
    if (typeof query.minPrice === "number" && product.price < query.minPrice) {
      return false;
    }
    if (typeof query.maxPrice === "number" && product.price > query.maxPrice) {
      return false;
    }
    return true;
  });
}
