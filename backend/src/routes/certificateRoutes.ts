import { Router } from "express";
import {
  generateCertificate,
  generateAndSaveCertificate,
  downloadCertificate,
} from "../controllers/certificateController";

const router = Router();

/**
 * POST /generate
 * Generate certificate and return as PDF stream (binary download)
 * Request: { layoutId, data }
 * Response: PDF binary stream
 */
router.post("/generate", generateCertificate);

/**
 * POST /generate-and-save
 * Generate certificate, save to disk, and return file info
 * Request: { layoutId, data, returnPath? }
 * Response: { fileName, path?, fileSize }
 */
router.post("/generate-and-save", generateAndSaveCertificate);

/**
 * GET /download/:fileName
 * Download previously generated certificate by file name
 */
router.get("/download/:fileName", downloadCertificate);

export default router;
