import type { NextFunction, Request, Response } from "express";
import { LRUCache } from "lru-cache";

type CachedPayload = Record<string, unknown>;

const cache = new LRUCache<string, CachedPayload>({
  max: 500,
  ttl: 1000 * 60 * 5,
});

export function cacheMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.method !== "POST") {
    next();
    return;
  }

  const key = JSON.stringify(req.body);
  const cached = cache.get(key);

  if (cached) {
    console.log("[CACHE] Hit:", key.substring(0, 50));
    res.json({ ...cached, cached: true });
    return;
  }

  const originalJson = res.json.bind(res);
  res.json = function patchedJson(body: CachedPayload) {
    cache.set(key, body);
    return originalJson(body);
  };

  next();
}
