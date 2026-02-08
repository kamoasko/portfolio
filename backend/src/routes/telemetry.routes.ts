import { Router } from "express";
import { TelemetryController } from "../controllers/telemetry.controller";
import { authMiddleware, adminMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.post("/events", TelemetryController.logEvent);

// Admin-only routes
router.get(
  "/analytics",
  authMiddleware,
  adminMiddleware,
  TelemetryController.getAnalytics,
);
router.get(
  "/summary",
  authMiddleware,
  adminMiddleware,
  TelemetryController.getSummary,
);

export default router;
