import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { cacheMiddleware } from "./middleware/cache";
import { requestLogger } from "./middleware/logger";
import { apiRateLimit } from "./middleware/rateLimit";
import healthRouter from "./routes/health";
import merchantsRouter from "./routes/merchants";
import searchRouter from "./routes/search";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(apiRateLimit);

app.use(healthRouter);
app.use(cacheMiddleware);
app.use(searchRouter);
app.use(merchantsRouter);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "Not found",
  });
});

app.listen(PORT, () => {
  console.log(`Rotavera Aggregator running on port ${PORT}`);
  console.log(`Federated search: POST http://localhost:${PORT}/search`);
  console.log(`Merchants: GET http://localhost:${PORT}/merchants`);
});
