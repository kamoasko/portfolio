import { Request, Response, NextFunction } from "express";
import { Message } from "../models/Message";
import { throwError } from "../middleware/errorHandler";
import { ApiResponse, PaginatedResponse } from "../types";

export class MessagesController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { isRead, isArchived, skip = 0, limit = 20 } = req.query;

      const query: any = {};

      if (isArchived === "true") {
        query.isArchived = true;
      } else if (isArchived === "false") {
        query.isArchived = false;
      }

      if (isRead === "true") {
        query.isRead = true;
      } else if (isRead === "false") {
        query.isRead = false;
      }

      const skipVal = parseInt(skip as string) || 0;
      const limitVal = parseInt(limit as string) || 20;

      const messages = await Message.find(query)
        .sort({ submittedAt: -1 })
        .skip(skipVal)
        .limit(limitVal)
        .lean();

      const total = await Message.countDocuments(query);
      const unread = await Message.countDocuments({
        isRead: false,
        isArchived: false,
      });

      const response: ApiResponse<PaginatedResponse<any> & { unread: number }> =
        {
          success: true,
          message: "Messages retrieved",
          data: {
            data: messages,
            total,
            page: Math.floor(skipVal / limitVal) + 1, // Corrected pagination logic (1-based index)
            limit: limitVal,
            unread,
          } as any,
        };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const message = await Message.findById(id).populate(
        "repliedBy",
        "email username",
      );

      if (!message) {
        throwError(404, "Message not found");
      }

      const response: ApiResponse<any> = {
        success: true,
        message: "Message retrieved",
        data: message,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, message: messageText } = req.body;

      // Validation
      if (!name || !email || !messageText) {
        throwError(400, "Name, email, and message are required");
      }

      const message = new Message({
        name,
        email: email.toLowerCase(),
        message: messageText,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        submittedAt: new Date(),
      });

      await message.save();

      const response: ApiResponse<any> = {
        success: true,
        message: "Message received",
        data: {
          id: message._id,
        },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const message = await Message.findByIdAndUpdate(
        id,
        { isRead: true },
        { new: true },
      ).populate("repliedBy", "email username");

      if (!message) {
        throwError(404, "Message not found");
      }

      const response: ApiResponse<any> = {
        success: true,
        message: "Message marked as read",
        data: message,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async reply(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reply } = req.body;

      if (!reply) {
        throwError(400, "Reply message is required");
      }

      const message = await Message.findByIdAndUpdate(
        id,
        {
          reply,
          repliedBy: req.user?.id,
          repliedAt: new Date(),
          isRead: true,
        },
        { new: true },
      ).populate("repliedBy", "email username");

      if (!message) {
        throwError(404, "Message not found");
      }

      const response: ApiResponse<any> = {
        success: true,
        message: "Reply sent",
        data: message,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async archive(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const message = await Message.findByIdAndUpdate(
        id,
        { isArchived: true },
        { new: true },
      ).populate("repliedBy", "email username");

      if (!message) {
        throwError(404, "Message not found");
      }

      const response: ApiResponse<any> = {
        success: true,
        message: "Message archived",
        data: message,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const message = await Message.findByIdAndDelete(id);

      if (!message) {
        throwError(404, "Message not found");
      }

      const response: ApiResponse<null> = {
        success: true,
        message: "Message deleted",
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
