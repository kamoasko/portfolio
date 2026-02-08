import { Router } from "express";
import { ContentController } from "../controllers/content.controller";
import {
  authMiddleware,
  adminMiddleware,
  optionalAuthMiddleware,
} from "../middleware/auth.middleware";

const router = Router();

// Public routes - can view content without auth
router.get("/:type", optionalAuthMiddleware, ContentController.getByType);
router.get("/skills", optionalAuthMiddleware, ContentController.getSkills);

// Admin-only routes
router.put(
  "/:type",
  authMiddleware,
  adminMiddleware,
  ContentController.updateByType,
);
router.put(
  "/skills/update",
  authMiddleware,
  adminMiddleware,
  ContentController.updateSkills,
);
router.put(
  "/social-links",
  authMiddleware,
  adminMiddleware,
  ContentController.updateSocialLinks,
);

export default router;
