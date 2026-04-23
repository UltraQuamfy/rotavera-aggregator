import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
