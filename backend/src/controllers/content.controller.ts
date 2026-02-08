import { Request, Response, NextFunction } from "express";
import { Content } from "../models/Content";
import { throwError } from "../middleware/errorHandler";
import { ApiResponse } from "../types";

export class ContentController {
  static async getByType(req: Request, res: Response, next: NextFunction) {
    try {
      const { type } = req.params;

      if (!["hero", "about", "skills"].includes(type as string)) {
        throwError(
          400,
          "Invalid content type. Must be: hero, about, or skills",
        );
      }

      let content = await Content.findOne({ type }).populate(
        "lastModifiedBy",
        "email username",
      );

      // If no content exists, create default content
      if (!content) {
        content = new Content({ type });
        // Set default values based on type
        if (type === "hero") {
          content.heroTitle = "Salam, mən Kamran";
          content.heroTagline =
            "Frontend Mühəndisi, Google Cloud həvəskarı, Problem Həll edən";
        } else if (type === "about") {
          content.aboutDescription =
            "Rəqəmsal təcrübələr yaratmağı sevən bir proqramçıyam.";
          content.skills = [
            {
              category: "Frontend",
              items: ["HTML", "CSS", "JavaScript", "Vue", "React"],
            },
            { category: "Backend", items: ["Node.js", "Express", "MongoDB"] },
            { category: "Cloud", items: ["Google Cloud", "AWS"] },
          ];
        } else if (type === "skills") {
          content.skills = [
            {
              category: "Frontend",
              items: ["HTML", "CSS", "JavaScript", "Vue", "React"],
            },
            { category: "Backend", items: ["Node.js", "Express", "MongoDB"] },
            { category: "Cloud", items: ["Google Cloud", "AWS"] },
          ];
        }
        await content.save();
      }

      const response: ApiResponse<any> = {
        success: true,
        message: `${type} content retrieved`,
        data: content,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async updateByType(req: Request, res: Response, next: NextFunction) {
    try {
      const { type } = req.params;
      const updateData = req.body;

      if (!["hero", "about", "skills"].includes(type as string)) {
        throwError(
          400,
          "Invalid content type. Must be: hero, about, or skills",
        );
      }

      const content = await Content.findOneAndUpdate(
        { type },
        {
          ...updateData,
          lastModifiedBy: req.user?.id,
          updatedAt: new Date(),
        },
        { new: true, upsert: true },
      ).populate("lastModifiedBy", "email username");

      const response: ApiResponse<any> = {
        success: true,
        message: `${type} content updated`,
        data: content,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getSkills(req: Request, res: Response, next: NextFunction) {
    try {
      const content = await Content.findOne({ type: "skills" });

      if (!content || !content.skills) {
        return res.json({
          success: true,
          message: "Skills retrieved",
          data: {
            skills: [],
          },
        });
      }

      const response: ApiResponse<any> = {
        success: true,
        message: "Skills retrieved",
        data: {
          skills: content.skills,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async updateSkills(req: Request, res: Response, next: NextFunction) {
    try {
      const { skills } = req.body;

      if (!Array.isArray(skills)) {
        throwError(400, "Skills must be an array");
      }

      const content = await Content.findOneAndUpdate(
        { type: "skills" },
        {
          skills,
          lastModifiedBy: req.user?.id,
          updatedAt: new Date(),
        },
        { new: true, upsert: true },
      ).populate("lastModifiedBy", "email username");

      const response: ApiResponse<any> = {
        success: true,
        message: "Skills updated",
        data: {
          skills: content.skills,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async updateSocialLinks(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { socialLinks } = req.body;

      if (!Array.isArray(socialLinks)) {
        throwError(400, "Social links must be an array");
      }

      let content = await Content.findOne({ type: "about" });

      if (!content) {
        content = new Content({ type: "about" });
      }

      content.socialLinks = socialLinks;
      content.lastModifiedBy = req.user?.id as any;
      content.updatedAt = new Date();

      await content.save();
      await content.populate("lastModifiedBy", "email username");

      const response: ApiResponse<any> = {
        success: true,
        message: "Social links updated",
        data: {
          socialLinks: content.socialLinks,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
