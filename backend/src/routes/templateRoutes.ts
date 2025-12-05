import { Router } from "express";
import {
  getPredefinedTemplates,
  createPredefinedTemplate,
  getPredefinedTemplateById,
} from "../controllers/templateController";

const router = Router();

/**
 * GET /templates
 * Get all predefined templates
 */
router.get("/", getPredefinedTemplates);

/**
 * GET /templates/:templateId
 * Get a specific predefined template
 */
router.get("/:templateId", getPredefinedTemplateById);

/**
 * POST /templates
 * Create a new predefined template (admin)
 */
router.post("/", createPredefinedTemplate);

export default router;
