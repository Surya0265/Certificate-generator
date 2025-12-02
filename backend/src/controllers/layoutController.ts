import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  loadLayout,
  saveLayout,
  listLayouts,
  deleteLayout,
  getDirectories,
} from "../utils/fileHandler";
import { Layout, TextField } from "../types";
import { asyncHandler, sendSuccess, sendError } from "../middleware/errorHandler";

/**
 * Save layout configuration
 */
export const saveLayoutConfig = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      layoutId,
      layoutName,
      templateFile,
      fonts,
      fields,
      createdBy,
    }: {
      layoutId?: string;
      layoutName?: string;
      templateFile: string;
      fonts: { name: string; file: string }[];
      fields: TextField[];
      createdBy?: string;
    } = req.body;

    if (!templateFile || !fields || fields.length === 0) {
      return sendError(res, "Template file and fields are required", 400);
    }

    // Validate fields
    for (const field of fields) {
      if (!field.name || field.x === undefined || field.y === undefined) {
        return sendError(
          res,
          "Each field must have name, x, and y coordinates",
          400
        );
      }
    }

    // Generate layoutId based on layoutName (REQUIRED)
    if (!layoutName || !layoutName.trim()) {
      return sendError(res, "Event name (layoutName) is required", 400);
    }

    // Convert layoutName to safe filename format and use as ID
    const safeName = layoutName
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .substring(0, 50)
      .toLowerCase();
    const newLayoutId = safeName;

    const layout: Layout = {
      layoutId: newLayoutId,
      layoutName: layoutName.toLowerCase() || newLayoutId,
      templateFile,
      fonts: fonts || [],
      fields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      confirmed: false,
      createdBy: createdBy || req.user?.username,
    };

    const saved = saveLayout(layout);
    if (!saved) {
      return sendError(res, "Failed to save layout", 500);
    }

    sendSuccess(res, layout, "Layout saved successfully", 201);
  }
);

/**
 * Confirm/publish layout (makes it read-only for generation)
 */
export const confirmLayout = asyncHandler(
  async (req: Request, res: Response) => {
    const { layoutId } = req.params;

    if (!layoutId) {
      return sendError(res, "Layout ID is required", 400);
    }

    const layout = loadLayout(layoutId);
    if (!layout) {
      return sendError(res, "Layout not found", 404);
    }

    layout.confirmed = true;
    layout.updatedAt = new Date().toISOString();

    const saved = saveLayout(layout);
    if (!saved) {
      return sendError(res, "Failed to confirm layout", 500);
    }

    sendSuccess(res, layout, "Layout confirmed successfully");
  }
);

/**
 * Get layout by ID
 */
export const getLayout = asyncHandler(async (req: Request, res: Response) => {
  const { layoutId } = req.params;

  if (!layoutId) {
    return sendError(res, "Layout ID is required", 400);
  }

  const layout = loadLayout(layoutId);
  if (!layout) {
    return sendError(res, "Layout not found", 404);
  }

  sendSuccess(res, layout, "Layout retrieved successfully");
});

/**
 * Get all layouts
 */
export const getAllLayouts = asyncHandler(
  async (req: Request, res: Response) => {
    const layouts = listLayouts();
    sendSuccess(
      res,
      layouts,
      `Found ${layouts.length} layout(s)`,
      200
    );
  }
);

/**
 * Delete layout
 */
export const removeLayout = asyncHandler(
  async (req: Request, res: Response) => {
    const { layoutId } = req.params;

    if (!layoutId) {
      return sendError(res, "Layout ID is required", 400);
    }

    const layout = loadLayout(layoutId);
    if (!layout) {
      return sendError(res, "Layout not found", 404);
    }

    if (layout.confirmed) {
      return sendError(
        res,
        "Cannot delete confirmed layout. Create a new layout instead.",
        400
      );
    }

    const deleted = deleteLayout(layoutId);
    if (!deleted) {
      return sendError(res, "Failed to delete layout", 500);
    }

    sendSuccess(res, { layoutId }, "Layout deleted successfully");
  }
);

/**
 * Update layout (only if not confirmed)
 */
export const updateLayout = asyncHandler(
  async (req: Request, res: Response) => {
    const { layoutId } = req.params;
    const { templateFile, fonts, fields, createdBy } = req.body;

    if (!layoutId) {
      return sendError(res, "Layout ID is required", 400);
    }

    const layout = loadLayout(layoutId);
    if (!layout) {
      return sendError(res, "Layout not found", 404);
    }

    if (layout.confirmed) {
      return sendError(
        res,
        "Cannot update confirmed layout. Create a new layout instead.",
        400
      );
    }

    if (templateFile) layout.templateFile = templateFile;
    if (fonts) layout.fonts = fonts;
    if (fields) {
      for (const field of fields) {
        if (!field.name || field.x === undefined || field.y === undefined) {
          return sendError(
            res,
            "Each field must have name, x, and y coordinates",
            400
          );
        }
      }
      layout.fields = fields;
    }

    if (createdBy) {
      layout.createdBy = createdBy;
    } else if (!layout.createdBy && req.user?.username) {
      layout.createdBy = req.user.username;
    }

    layout.updatedAt = new Date().toISOString();
    const saved = saveLayout(layout);
    if (!saved) {
      return sendError(res, "Failed to update layout", 500);
    }

    sendSuccess(res, layout, "Layout updated successfully");
  }
);
