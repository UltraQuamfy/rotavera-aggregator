import assert from "node:assert/strict";
import test from "node:test";
import { federatedSearch } from "../src/services/federatedSearch";

test("federated search returns merged merchant results", async () => {
  const result = await federatedSearch({
    query: "coffee",
    category: "coffee",
    limit: 10,
  });

  assert.ok(Array.isArray(result.products));
  assert.ok(Array.isArray(result.merchants));
  assert.ok(result.merchants.length > 0);
  assert.ok(result.totalResults >= result.products.length);
  assert.equal(result.query.query, "coffee");
});
