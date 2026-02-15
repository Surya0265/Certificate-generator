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
      console.error("Template upload failed: No file in request");
      return sendError(res, "No file uploaded", 400);
    }

    console.log(`Template uploaded successfully: ${req.file.filename} (${req.file.size} bytes)`);
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
      console.error("Font upload failed: No file in request");
      return sendError(res, "No file uploaded", 400);
    }

    console.log(`Font uploaded successfully: ${req.file.filename} (${req.file.size} bytes)`);

    // Rename file if layoutName is provided
    if (req.body.layoutName) {
      const fs = require('fs');
      const path = require('path');

      const safeName = req.body.layoutName
        .replace(/[^a-zA-Z0-9-_]/g, "_")
        .substring(0, 50)
        .toLowerCase();

      const extension = path.extname(req.file.originalname);
      const newFilename = `${safeName}${extension}`;
      const newPath = path.join(req.file.destination, newFilename);

      try {
        // Check if file with new name already exists, if so, append timestamp or uuid
        if (fs.existsSync(newPath)) {
          // Option: overwrite or error? User requested "store the font upload in the same name as the layout name"
          // Let's overwrite as it seems to be the intent to verify strict naming.
          // Or maybe just append a short hash to avoid conflict if multiple uploads happen?
          // "store ... in the same name as the layout name" implies exact match.
          // I will overwrite.
        }

        fs.renameSync(req.file.path, newPath);

        // Update req.file properties to reflect the change
        req.file.filename = newFilename;
        req.file.path = newPath;

        console.log(`Font renamed to: ${newFilename}`);
      } catch (err) {
        console.error("Error renaming font file:", err);
        // Continue with original name if rename fails
      }
    }

    const fileInfo = cleanFileInfo(req.file);
    sendSuccess(res, fileInfo, "Font uploaded successfully", 201);
  }
);
