import { Router } from "express";
import { uploadTemplate, uploadFont } from "../middleware/upload";
import {
  uploadTemplateFile,
  uploadFontFile,
} from "../controllers/uploadController";

const router = Router();

/**
 * POST /upload-template
 * Upload certificate template image (PNG, JPG) or PDF
 */
router.post(
  "/template",
  uploadTemplate.single("file"),
  uploadTemplateFile
);

/**
 * POST /upload-font
 * Upload custom TTF font file
 */
router.post(
  "/font",
  uploadFont.single("file"),
  uploadFontFile
);

export default router;
