import assert from "node:assert/strict";
import test from "node:test";
import { federatedSearch } from "../src/services/federatedSearch";
import { parseA2AUASQuery } from "../src/services/a2auas";

test("natural language query can drive federated search", async () => {
  const structured = await parseA2AUASQuery({
    naturalLanguage: "show me electronics under $80",
  });
  const result = await federatedSearch({
    ...structured,
    limit: 5,
  });

  assert.equal(result.query.category, "electronics");
  assert.equal(result.query.maxPrice, 80);
  assert.ok(result.products.length <= 5);
});
