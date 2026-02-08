import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  error: ApiError | Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = (error as ApiError).statusCode || 500;
  const message = error.message || "Internal Server Error";

  console.error(`[ERROR] ${statusCode} - ${message}`, error);

  const response: ApiResponse<null> = {
    success: false,
    message,
    error: error.message,
  };

  res.status(statusCode).json(response);
};

// Helper function to throw API errors
export const throwError = (statusCode: number, message: string): never => {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  throw error;
};
