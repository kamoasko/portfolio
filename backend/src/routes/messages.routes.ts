import { Router } from "express";
import { MessagesController } from "../controllers/messages.controller";
import { authMiddleware, adminMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.post("/", MessagesController.create);

// Admin-only routes
router.get("/", authMiddleware, adminMiddleware, MessagesController.getAll);
router.get("/:id", authMiddleware, adminMiddleware, MessagesController.getById);
router.patch(
  "/:id/read",
  authMiddleware,
  adminMiddleware,
  MessagesController.markAsRead,
);
router.patch(
  "/:id/reply",
  authMiddleware,
  adminMiddleware,
  MessagesController.reply,
);
router.patch(
  "/:id/archive",
  authMiddleware,
  adminMiddleware,
  MessagesController.archive,
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  MessagesController.delete,
);

export default router;
