export interface Merchant {
  id: string;
  name: string;
  domain: string;
  endpoint: string;
  categories: string[];
  status: "active" | "inactive";
  lastHealthCheck?: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  merchantId: string;
  merchantName: string;
  inStock: boolean;
  gtin?: string;
  images?: string[];
}

export interface SearchQuery {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
}

export interface A2AUASQuery {
  naturalLanguage: string;
  structuredQuery?: SearchQuery;
}

export interface FederatedSearchResult {
  products: Product[];
  merchants: {
    id: string;
    name: string;
    count: number;
  }[];
  totalResults: number;
  searchTime: number;
  query: SearchQuery;
}
