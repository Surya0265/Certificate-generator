import { Request, Response } from "express";
import { asyncHandler, sendSuccess, sendError } from "../middleware/errorHandler";
import { PredefinedTemplate } from "../models/PredefinedTemplate";

/**
 * Get all predefined templates
 */
export const getPredefinedTemplates = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const templates = await PredefinedTemplate.find().sort({ createdAt: -1 });
      
      const formattedTemplates = templates.map((template) => ({
        templateId: template.templateId,
        templateName: template.templateName,
        description: template.description,
        fileName: template.fileName,
        category: template.category,
        createdAt: template.createdAt?.toISOString(),
        updatedAt: template.updatedAt?.toISOString(),
      }));

      sendSuccess(res, formattedTemplates, "Predefined templates retrieved successfully");
    } catch (error) {
      sendError(res, "Failed to retrieve templates", 500);
    }
  }
);

/**
 * Create a predefined template (admin only)
 */
export const createPredefinedTemplate = asyncHandler(
  async (req: Request, res: Response) => {
    const { templateId, templateName, description, fileName, category } = req.body;

    if (!templateId || !templateName || !fileName) {
      return sendError(res, "Missing required fields: templateId, templateName, fileName", 400);
    }

    try {
      const existingTemplate = await PredefinedTemplate.findOne({ templateId });
      if (existingTemplate) {
        return sendError(res, "Template with this ID already exists", 409);
      }

      const newTemplate = new PredefinedTemplate({
        templateId,
        templateName,
        description: description || "",
        fileName,
        category: category || "general",
      });

      await newTemplate.save();

      const formattedTemplate = {
        templateId: newTemplate.templateId,
        templateName: newTemplate.templateName,
        description: newTemplate.description,
        fileName: newTemplate.fileName,
        category: newTemplate.category,
        createdAt: newTemplate.createdAt?.toISOString(),
        updatedAt: newTemplate.updatedAt?.toISOString(),
      };

      sendSuccess(res, formattedTemplate, "Template created successfully", 201);
    } catch (error) {
      sendError(res, "Failed to create template", 500);
    }
  }
);

/**
 * Get template by ID
 */
export const getPredefinedTemplateById = asyncHandler(
  async (req: Request, res: Response) => {
    const { templateId } = req.params;

    try {
      const template = await PredefinedTemplate.findOne({ templateId });
      if (!template) {
        return sendError(res, "Template not found", 404);
      }

      const formattedTemplate = {
        templateId: template.templateId,
        templateName: template.templateName,
        description: template.description,
        fileName: template.fileName,
        category: template.category,
        createdAt: template.createdAt?.toISOString(),
        updatedAt: template.updatedAt?.toISOString(),
      };

      sendSuccess(res, formattedTemplate, "Template retrieved successfully");
    } catch (error) {
      sendError(res, "Failed to retrieve template", 500);
    }
  }
);
