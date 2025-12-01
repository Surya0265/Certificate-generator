import { Request, Response } from "express";
import { asyncHandler, sendSuccess, sendError } from "../middleware/errorHandler";

/**
 * Handle template upload
 */
export const uploadTemplateFile = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      return sendError(res, "No file uploaded", 400);
    }

    const file = req.file;
    const fileInfo = {
      fileName: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date().toISOString(),
    };

    sendSuccess(res, fileInfo, "Template uploaded successfully", 201);
  }
);

/**
 * Handle font upload
 */
export const uploadFontFile = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      return sendError(res, "No file uploaded", 400);
    }

    const file = req.file;
    const fileInfo = {
      fileName: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date().toISOString(),
    };

    sendSuccess(res, fileInfo, "Font uploaded successfully", 201);
  }
);
