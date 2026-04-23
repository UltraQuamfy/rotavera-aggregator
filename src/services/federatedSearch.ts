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

  await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 100));

  return {
    products: generateMockProducts(merchant, query),
  };
}

function generateMockProducts(merchant: Merchant, query: SearchQuery): Product[] {
  const count = Math.floor(Math.random() * 5) + 1;
  const products: Product[] = [];

  for (let i = 0; i < count; i += 1) {
    products.push({
      id: `${merchant.id}_prod_${i + 1}`,
      name: `${query.query} - ${merchant.name} Product ${i + 1}`,
      description: `High-quality ${query.query} from ${merchant.name}`,
      price: Math.floor(Math.random() * 100) + 20,
      currency: "AUD",
      category: merchant.categories[0] || "general",
      merchantId: merchant.id,
      merchantName: merchant.name,
      inStock: Math.random() > 0.2,
      gtin: `952${Math.floor(Math.random() * 10_000_000_000)}`,
    });
  }

  return products;
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
