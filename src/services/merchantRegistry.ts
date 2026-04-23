import merchantsData from "../config/merchants.json";
import type { Merchant } from "../types";

class MerchantRegistry {
  private merchants: Map<string, Merchant> = new Map();

  constructor() {
    this.loadMerchants();
  }

  private loadMerchants() {
    merchantsData.forEach((merchant) => {
      this.merchants.set(merchant.id, merchant as Merchant);
    });
    console.log(`[REGISTRY] Loaded ${this.merchants.size} merchants`);
  }

  getAll(): Merchant[] {
    return Array.from(this.merchants.values());
  }

  getActive(): Merchant[] {
    return this.getAll().filter((m) => m.status === "active");
  }

  getById(id: string): Merchant | undefined {
    return this.merchants.get(id);
  }

  getByCategory(category: string): Merchant[] {
    const normalized = category.toLowerCase();
    return this.getActive().filter((m) => m.categories.includes(normalized));
  }

  getByDomain(domain: string): Merchant | undefined {
    return this.getAll().find((m) => m.domain === domain);
  }
}

export const merchantRegistry = new MerchantRegistry();
