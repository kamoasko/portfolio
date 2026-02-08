import mongoose, { Schema, Document } from "mongoose";
import { IProject } from "../types";

interface IProjectDocument extends IProject, Document {}

const projectSchema = new Schema<IProjectDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    fullDescription: {
      type: String,
      trim: true,
    },
    technologies: {
      type: [String],
      default: [],
    },
    previewColor: {
      type: String,
      required: true,
      default: "#3b82f6",
    },
    previewImage: {
      type: String,
    },
    externalLink: {
      type: String,
    },
    githubLink: {
      type: String,
    },
    demoLink: {
      type: String,
    },
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Index for sorting and filtering
projectSchema.index({ isPublished: 1, order: 1 });
projectSchema.index({ createdAt: -1 });

export const Project = mongoose.model<IProjectDocument>(
  "Project",
  projectSchema,
);
