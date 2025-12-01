import { Router } from "express";
import {
  saveLayoutConfig,
  confirmLayout,
  getLayout,
  getAllLayouts,
  removeLayout,
  updateLayout,
} from "../controllers/layoutController";

const router = Router();

/**
 * POST /layouts
 * Save new layout configuration
 */
router.post("/", saveLayoutConfig);

/**
 * GET /layouts
 * Get all layouts
 */
router.get("/", getAllLayouts);

/**
 * GET /layouts/:layoutId
 * Get layout by ID
 */
router.get("/:layoutId", getLayout);

/**
 * PUT /layouts/:layoutId
 * Update layout (only if not confirmed)
 */
router.put("/:layoutId", updateLayout);

/**
 * POST /layouts/:layoutId/confirm
 * Confirm/publish layout (makes it read-only)
 */
router.post("/:layoutId/confirm", confirmLayout);

/**
 * DELETE /layouts/:layoutId
 * Delete layout (only if not confirmed)
 */
router.delete("/:layoutId", removeLayout);

export default router;
