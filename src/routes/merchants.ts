import { Router } from "express";
import { merchantRegistry } from "../services/merchantRegistry";

const router = Router();

router.get("/merchants", (req, res) => {
  const { category, status } = req.query;
  let merchants = merchantRegistry.getAll();

  if (typeof category === "string") {
    merchants = merchantRegistry.getByCategory(category);
  }

  if (typeof status === "string") {
    merchants = merchants.filter((m) => m.status === status);
  }

  res.json({
    success: true,
    merchants,
    count: merchants.length,
  });
});

router.get("/merchants/:id", (req, res) => {
  const merchant = merchantRegistry.getById(req.params.id);

  if (!merchant) {
    res.status(404).json({
      success: false,
      error: "Merchant not found",
    });
    return;
  }

  res.json({
    success: true,
    merchant,
  });
});

export default router;
