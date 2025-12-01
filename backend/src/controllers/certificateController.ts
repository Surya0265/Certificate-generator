import { Request, Response } from "express";
import { loadLayout, getCertificatePath, getDirectories } from "../utils/fileHandler";
import { generateCertificatePDF } from "../utils/pdfGenerator";
import { asyncHandler, sendError } from "../middleware/errorHandler";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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

    // Load layout
    const layout = loadLayout(layoutId);
    if (!layout) {
      return sendError(res, `Layout not found: ${layoutId}`, 404);
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

      // Use layoutName + Name from request in certificate filename
      const eventName = layout.layoutName || layout.layoutId;
      const personName = data.Name || "Certificate";
      const certificateFileName = `${eventName}_${personName}.pdf`;
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

    // Load layout
    const layout = loadLayout(layoutId);
    if (!layout) {
      return sendError(res, `Layout not found: ${layoutId}`, 404);
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
      const eventName = layout.layoutName || layout.layoutId;
      const personName = data.Name || "Certificate";
      const certificateFileName = `${eventName}_${personName}.pdf`;
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
          path: returnPath ? filePath : undefined,
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
