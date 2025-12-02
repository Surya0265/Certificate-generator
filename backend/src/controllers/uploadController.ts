import { Request, Response } from "express";
import { asyncHandler, sendSuccess, sendError } from "../middleware/errorHandler";

// Helper function to clean file upload response
const cleanFileInfo = (file: any) => {
  return {
    fileName: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    uploadedAt: new Date().toISOString(),
  };
};

/**
 * Handle template upload
 */
export const uploadTemplateFile = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      return sendError(res, "No file uploaded", 400);
    }

    const fileInfo = cleanFileInfo(req.file);
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

    const fileInfo = cleanFileInfo(req.file);
    sendSuccess(res, fileInfo, "Font uploaded successfully", 201);
  }
);
