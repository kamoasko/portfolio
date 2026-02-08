import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/environment";
import { TokenPayload } from "../types";
import { throwError } from "./errorHandler";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throwError(401, "Missing or invalid authorization header");
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throwError(401, "Token has expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throwError(401, "Invalid token");
    }
    next(error);
  }
};

// Optional auth - doesn't throw, just adds user if available
export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;

      req.user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };
    }
  } catch (error) {
    // Ignore errors in optional auth, just continue
  }

  next();
};

// Admin-only middleware
export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    throwError(401, "Authentication required");
  }

  if (req.user.role !== "admin") {
    throwError(403, "Admin access required");
  }

  next();
};
