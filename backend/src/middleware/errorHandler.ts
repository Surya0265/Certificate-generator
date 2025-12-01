import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  error: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const message = error.message || "Internal Server Error";

  const response: ApiResponse = {
    success: false,
    message,
    error: message,
  };

  res.status(statusCode).json(response);
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = "Success",
  statusCode: number = 200
): void {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  error: string,
  statusCode: number = 400
): void {
  const response: ApiResponse = {
    success: false,
    message: error,
    error,
  };
  res.status(statusCode).json(response);
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
