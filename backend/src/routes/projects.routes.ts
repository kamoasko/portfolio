import { Router } from "express";
import { ProjectsController } from "../controllers/projects.controller";
import {
  authMiddleware,
  adminMiddleware,
  optionalAuthMiddleware,
} from "../middleware/auth.middleware";

const router = Router();

// Public routes - can view published projects without auth
router.get("/", optionalAuthMiddleware, ProjectsController.getAll);
router.get("/:id", optionalAuthMiddleware, ProjectsController.getById);

// Admin-only routes
router.post("/", authMiddleware, adminMiddleware, ProjectsController.create);
router.put("/:id", authMiddleware, adminMiddleware, ProjectsController.update);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  ProjectsController.delete,
);
router.patch(
  "/:id/publish",
  authMiddleware,
  adminMiddleware,
  ProjectsController.togglePublish,
);
router.patch(
  "/reorder",
  authMiddleware,
  adminMiddleware,
  ProjectsController.reorder,
);

export default router;
