import mongoose, { Schema, Document } from "mongoose";
import { IContent } from "../types";

interface IContentDocument extends IContent, Document {}

const skillItemSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
    },
    items: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

const socialLinkSchema = new Schema(
  {
    platform: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const contentSchema = new Schema<IContentDocument>(
  {
    type: {
      type: String,
      enum: ["hero", "about", "skills"],
      required: true,
      unique: true,
    },
    heroTitle: {
      type: String,
      trim: true,
    },
    heroTagline: {
      type: String,
      trim: true,
    },
    heroImage: {
      type: String,
    },
    aboutDescription: {
      type: String,
      trim: true,
    },
    aboutImage: {
      type: String,
    },
    aboutImageAlt: {
      type: String,
      trim: true,
    },
    skills: {
      type: [skillItemSchema],
      default: [],
    },
    socialLinks: {
      type: [socialLinkSchema],
      default: [],
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: "updatedAt" },
  },
);

export const Content = mongoose.model<IContentDocument>(
  "Content",
  contentSchema,
);
