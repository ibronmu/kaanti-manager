import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import businessRoutes from "./routes/business.routes";
import { errorHandler, notFound } from "./middleware/error";
import { apiLimiter } from "./middleware/rateLimit";
import { openapiSpec } from "./docs/openapi";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(apiLimiter);

  app.get("/health", (_req, res) => res.json({ success: true, message: "ok" }));

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/businesses", businessRoutes);

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

  app.use(notFound);
  app.use(errorHandler);

  return app;
};