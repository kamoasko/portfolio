import { Request, Response, NextFunction } from "express";
import { Project } from "../models/Project";
import { throwError } from "../middleware/errorHandler";
import { ApiResponse, PaginatedResponse } from "../types";

export class ProjectsController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { published, sort, skip = 0, limit = 10 } = req.query;

      const query: any = {};

      // If user is not admin, only show published projects
      if (!req.user || req.user.role !== "admin") {
        query.isPublished = true;
      }

      // Filter by published status if specified
      if (published === "true") {
        query.isPublished = true;
      } else if (published === "false") {
        query.isPublished = false;
      }

      const projects = await Project.find(query)
        .sort({ order: 1, createdAt: -1 })
        .skip(parseInt(skip as string) || 0)
        .limit(parseInt(limit as string) || 10)
        .populate("createdBy", "email username")
        .lean();

      const total = await Project.countDocuments(query);

      const response: ApiResponse<PaginatedResponse<any>> = {
        success: true,
        message: "Projects retrieved",
        data: {
          data: projects,
          total,
          page: Math.floor(
            parseInt(skip as string) || 0 / parseInt(limit as string) || 10,
          ),
          limit: parseInt(limit as string) || 10,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const project = await Project.findById(id).populate(
        "createdBy",
        "email username",
      );

      if (!project) {
        throwError(404, "Project not found");
      }

      // Check if user has permission to view
      if (!project.isPublished && (!req.user || req.user.role !== "admin")) {
        throwError(403, "You do not have permission to view this project");
      }

      const response: ApiResponse<any> = {
        success: true,
        message: "Project retrieved",
        data: project,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        title,
        description,
        fullDescription,
        technologies,
        previewColor,
        previewImage,
        externalLink,
        githubLink,
        demoLink,
        order,
        isPublished,
      } = req.body;

      // Validation
      if (!title || !description) {
        throwError(400, "Title and description are required");
      }

      // Get max order if not provided
      let finalOrder = order;
      if (finalOrder === undefined) {
        const maxOrderProject = await Project.findOne()
          .sort({ order: -1 })
          .lean();
        finalOrder = (maxOrderProject?.order || 0) + 1;
      }

      const project = new Project({
        title,
        description,
        fullDescription,
        technologies: technologies || [],
        previewColor,
        previewImage,
        externalLink,
        githubLink,
        demoLink,
        order: finalOrder,
        isPublished: isPublished || false,
        createdBy: req.user?.id,
      });

      await project.save();
      await project.populate("createdBy", "email username");

      const response: ApiResponse<any> = {
        success: true,
        message: "Project created successfully",
        data: project,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        fullDescription,
        technologies,
        previewColor,
        previewImage,
        externalLink,
        githubLink,
        demoLink,
        order,
        isPublished,
      } = req.body;

      const project = await Project.findById(id);

      if (!project) {
        throwError(404, "Project not found");
      }

      // Update fields
      if (title) project.title = title;
      if (description) project.description = description;
      if (fullDescription !== undefined)
        project.fullDescription = fullDescription;
      if (technologies) project.technologies = technologies;
      if (previewColor) project.previewColor = previewColor;
      if (previewImage !== undefined) project.previewImage = previewImage;
      if (externalLink !== undefined) project.externalLink = externalLink;
      if (githubLink !== undefined) project.githubLink = githubLink;
      if (demoLink !== undefined) project.demoLink = demoLink;
      if (order !== undefined) project.order = order;
      if (isPublished !== undefined) project.isPublished = isPublished;

      await project.save();
      await project.populate("createdBy", "email username");

      const response: ApiResponse<any> = {
        success: true,
        message: "Project updated successfully",
        data: project,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const project = await Project.findByIdAndDelete(id);

      if (!project) {
        throwError(404, "Project not found");
      }

      const response: ApiResponse<null> = {
        success: true,
        message: "Project deleted successfully",
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async togglePublish(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const project = await Project.findById(id);

      if (!project) {
        throwError(404, "Project not found");
      }

      project.isPublished = !project.isPublished;
      await project.save();
      await project.populate("createdBy", "email username");

      const response: ApiResponse<any> = {
        success: true,
        message: `Project ${project.isPublished ? "published" : "unpublished"}`,
        data: project,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      const { projects: projectsToReorder } = req.body;

      if (!Array.isArray(projectsToReorder)) {
        throwError(400, "Projects array is required");
      }

      // Update all projects with new order
      const updatePromises = projectsToReorder.map((p) =>
        Project.findByIdAndUpdate(
          p.id,
          { order: p.order },
          { new: true },
        ).populate("createdBy", "email username"),
      );

      const updatedProjects = await Promise.all(updatePromises);

      const response: ApiResponse<any> = {
        success: true,
        message: "Projects reordered successfully",
        data: updatedProjects,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
