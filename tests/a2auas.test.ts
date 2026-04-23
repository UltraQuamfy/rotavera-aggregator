import assert from "node:assert/strict";
import test from "node:test";
import { parseA2AUASQuery } from "../src/services/a2auas";

test("parses category and maxPrice from natural language", async () => {
  const parsed = await parseA2AUASQuery({
    naturalLanguage: "find me some coffee beans under $30",
  });

  assert.equal(parsed.category, "coffee");
  assert.equal(parsed.maxPrice, 30);
  assert.match(parsed.query, /coffee beans/);
});
