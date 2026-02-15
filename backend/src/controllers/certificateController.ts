import { Request, Response } from "express";
import { loadLayout, getCertificatePath, getDirectories } from "../utils/fileHandler";
import { generateCertificatePDF } from "../utils/pdfGenerator";
import { asyncHandler, sendError } from "../middleware/errorHandler";
import fs from "fs";
import path from "path";

const sanitizeSegment = (value: string): string => {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60) || "Value";
};

/**
 * Generate certificate PDF based on layout and data
 */
export const generateCertificate = asyncHandler(
  async (req: Request, res: Response) => {
    const { layoutId, data } = req.body;

    if (!layoutId || !data) {
      return sendError(res, "layoutId and data are required", 400);
    }

    if (typeof data !== "object" || Object.keys(data).length === 0) {
      return sendError(res, "Data must be a non-empty object", 400);
    }

    // Load layout - try exact match first, then case-insensitive
    let layout = await loadLayout(layoutId);

    // If not found, try case-insensitive search
    if (!layout) {
      const { getDirectories } = await import("../utils/fileHandler");
      const { LAYOUTS_DIR } = getDirectories();
      const fs = await import("fs");
      const path = await import("path");

      if (fs.existsSync(LAYOUTS_DIR)) {
        const files = fs.readdirSync(LAYOUTS_DIR);
        const matchingFile = files.find(
          (file) => file.toLowerCase() === `${layoutId.toLowerCase()}.json`
        );

        if (matchingFile) {
          const actualLayoutId = matchingFile.replace(".json", "");
          layout = await loadLayout(actualLayoutId);
        }
      }
    }

    if (!layout) {
      console.error(`Layout not found: ${layoutId}`);
      return sendError(res, `Layout not found: ${layoutId}. Please check the layout name and try again.`, 404);
    }

    if (!layout.confirmed) {
      return sendError(
        res,
        "Layout is not confirmed. Please confirm the layout first.",
        400
      );
    }

    try {
      // Generate PDF
      const pdfBuffer = await generateCertificatePDF(layout, data);

      // Use Name + Layout name for filename
      const personNameRaw = data.Name || "Certificate";
      const layoutIdRaw = (layout.layoutId || "layout").toLowerCase();
      const certificateFileName = `${sanitizeSegment(personNameRaw)}_${sanitizeSegment(layoutIdRaw)}_Certificate.pdf`;
      res.setHeader(
        "Access-Control-Expose-Headers",
        "Content-Disposition, X-Certificate-Filename"
      );
      res.setHeader("X-Certificate-Filename", certificateFileName);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${certificateFileName}"`
      );
      res.setHeader("Content-Length", pdfBuffer.length);

      // Send PDF as binary stream
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error("Certificate generation error:", error);
      return sendError(
        res,
        `Failed to generate certificate: ${error.message}`,
        500
      );
    }
  }
);

/**
 * Generate certificate and save to disk (alternative endpoint)
 */
export const generateAndSaveCertificate = asyncHandler(
  async (req: Request, res: Response) => {
    const { layoutId, data, returnPath = false } = req.body;

    if (!layoutId || !data) {
      return sendError(res, "layoutId and data are required", 400);
    }

    if (typeof data !== "object" || Object.keys(data).length === 0) {
      return sendError(res, "Data must be a non-empty object", 400);
    }

    // Load layout - try exact match first, then case-insensitive
    let layout = await loadLayout(layoutId);

    // If not found, try case-insensitive search
    if (!layout) {
      const { getDirectories } = await import("../utils/fileHandler");
      const { LAYOUTS_DIR } = getDirectories();
      const fs = await import("fs");
      const path = await import("path");

      if (fs.existsSync(LAYOUTS_DIR)) {
        const files = fs.readdirSync(LAYOUTS_DIR);
        const matchingFile = files.find(
          (file) => file.toLowerCase() === `${layoutId.toLowerCase()}.json`
        );

        if (matchingFile) {
          const actualLayoutId = matchingFile.replace(".json", "");
          layout = await loadLayout(actualLayoutId);
        }
      }
    }

    if (!layout) {
      console.error(`Layout not found: ${layoutId}`);
      return sendError(res, `Layout not found: ${layoutId}. Please check the layout name and try again.`, 404);
    }

    if (!layout.confirmed) {
      return sendError(
        res,
        "Layout is not confirmed. Please confirm the layout first.",
        400
      );
    }

    try {
      // Generate PDF
      const pdfBuffer = await generateCertificatePDF(layout, data);
      const personNameRaw = data.Name || "Certificate";
      const layoutIdRaw = (layout.layoutId || "layout").toLowerCase();
      const certificateFileName = `${sanitizeSegment(personNameRaw)}_Layout_${sanitizeSegment(layoutIdRaw)}_Certificate.pdf`;
      res.setHeader(
        "Access-Control-Expose-Headers",
        "Content-Disposition, X-Certificate-Filename"
      );
      res.setHeader("X-Certificate-Filename", certificateFileName);
      const { CERTIFICATES_DIR } = getDirectories();

      // Ensure certificates directory exists
      if (!fs.existsSync(CERTIFICATES_DIR)) {
        fs.mkdirSync(CERTIFICATES_DIR, { recursive: true });
      }

      // Save to disk
      const filePath = path.join(CERTIFICATES_DIR, certificateFileName);
      fs.writeFileSync(filePath, pdfBuffer);

      res.json({
        success: true,
        message: "Certificate generated and saved successfully",
        data: {
          fileName: certificateFileName,
          fileSize: pdfBuffer.length,
        },
      });
    } catch (error: any) {
      console.error("Certificate generation error:", error);
      return sendError(
        res,
        `Failed to generate certificate: ${error.message}`,
        500
      );
    }
  }
);

/**
 * Download saved certificate
 */
export const downloadCertificate = asyncHandler(
  async (req: Request, res: Response) => {
    const { fileName } = req.params;

    if (!fileName) {
      return sendError(res, "File name is required", 400);
    }

    const { CERTIFICATES_DIR } = getDirectories();
    const filePath = path.join(CERTIFICATES_DIR, fileName);

    // Security: prevent directory traversal
    if (!filePath.startsWith(CERTIFICATES_DIR)) {
      return sendError(res, "Invalid file path", 400);
    }

    if (!fs.existsSync(filePath)) {
      return sendError(res, "Certificate file not found", 404);
    }

    try {
      const fileBuffer = fs.readFileSync(filePath);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );
      res.setHeader("Content-Length", fileBuffer.length);
      res.send(fileBuffer);
    } catch (error: any) {
      console.error("Download error:", error);
      return sendError(res, "Failed to download certificate", 500);
    }
  }
);
