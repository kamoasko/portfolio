import mongoose, { Schema, Document } from "mongoose";
import { IMessage } from "../types";

interface IMessageDocument extends IMessage, Document {}

const messageSchema = new Schema<IMessageDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    reply: {
      type: String,
    },
    repliedAt: {
      type: Date,
    },
    repliedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "submittedAt", updatedAt: false },
  },
);

// Index for filtering
messageSchema.index({ isRead: 1, isArchived: 1 });
messageSchema.index({ submittedAt: -1 });
messageSchema.index({ email: 1 });

export const Message = mongoose.model<IMessageDocument>(
  "Message",
  messageSchema,
);
