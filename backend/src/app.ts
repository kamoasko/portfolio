import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import { config } from "./config/environment";
import { connectDatabase } from "./config/database";
import { ApiResponse } from "./types";

// Middleware
import { errorHandler } from "./middleware/errorHandler";

// Routes
import authRoutes from "./routes/auth.routes";
import projectsRoutes from "./routes/projects.routes";
import contentRoutes from "./routes/content.routes";
import messagesRoutes from "./routes/messages.routes";
import telemetryRoutes from "./routes/telemetry.routes";

export async function createApp(): Promise<Express> {
  const app = express();

  // Connect to database
  await connectDatabase();

  // Middleware
  // Fix: Pass the array from config to cors origin
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  // Health check endpoint
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    });
  });

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/projects", projectsRoutes);
  app.use("/api/content", contentRoutes);
  app.use("/api/messages", messagesRoutes);
  app.use("/api/telemetry", telemetryRoutes);

  // 404 handler
  app.use("*", (req: Request, res: Response) => {
    const response: ApiResponse<null> = {
      success: false,
      message: "Route not found",
      error: `${req.method} ${req.originalUrl} not found`,
    };
    res.status(404).json(response);
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}

export default createApp;