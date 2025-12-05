import fs from "fs";
import path from "path";
import { Layout as LayoutModel } from "../models/Layout";
import { Layout } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
const LAYOUTS_DIR = path.join(DATA_DIR, "layouts");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const TEMPLATES_DIR = path.join(UPLOADS_DIR, "templates");
const FONTS_DIR = path.join(UPLOADS_DIR, "fonts");
const CERTIFICATES_DIR = path.join(DATA_DIR, "certificates");

// Ensure all directories exist
export function ensureDirectories(): void {
  [
    DATA_DIR,
    UPLOADS_DIR,
    TEMPLATES_DIR,
    FONTS_DIR,
    CERTIFICATES_DIR,
  ].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Get all directories
export function getDirectories() {
  return {
    DATA_DIR,
    LAYOUTS_DIR,
    UPLOADS_DIR,
    TEMPLATES_DIR,
    FONTS_DIR,
    CERTIFICATES_DIR,
  };
}

// Load layout from MongoDB
export async function loadLayout(layoutId: string): Promise<Layout | null> {
  try {
    const layout = await LayoutModel.findOne({ layoutId });
    if (!layout) {
      return null;
    }
    const layoutObj = layout.toObject();
    return {
      ...layoutObj,
      createdAt: layoutObj.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: layoutObj.updatedAt?.toISOString() || new Date().toISOString(),
    } as unknown as Layout;
  } catch (error) {
    console.error(`Error loading layout ${layoutId}:`, error);
    return null;
  }
}

// Save layout to MongoDB
export async function saveLayout(layout: Layout): Promise<boolean> {
  try {
    await LayoutModel.findOneAndUpdate(
      { layoutId: layout.layoutId },
      {
        layoutName: layout.layoutName,
        templateFile: layout.templateFile,
        fonts: layout.fonts,
        fields: layout.fields,
        confirmed: layout.confirmed,
        createdBy: layout.createdBy,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );
    return true;
  } catch (error) {
    console.error(`Error saving layout:`, error);
    return false;
  }
}

// List all layouts
export async function listLayouts(): Promise<Layout[]> {
  try {
    const layouts = await LayoutModel.find({}).lean();
    return layouts.map((layout: any) => ({
      ...layout,
      createdAt: layout.createdAt?.toISOString?.() || new Date().toISOString(),
      updatedAt: layout.updatedAt?.toISOString?.() || new Date().toISOString(),
    })) as unknown as Layout[];
  } catch (error) {
    console.error("Error listing layouts:", error);
    return [];
  }
}

// Delete layout
export async function deleteLayout(layoutId: string): Promise<boolean> {
  try {
    const result = await LayoutModel.findOneAndDelete({ layoutId });
    return !!result;
  } catch (error) {
    console.error(`Error deleting layout:`, error);
    return false;
  }
}

// Get template file path
export function getTemplatePath(templateFileName: string): string {
  return path.join(TEMPLATES_DIR, templateFileName);
}

// Get font file path
export function getFontPath(fontFileName: string): string {
  return path.join(FONTS_DIR, fontFileName);
}

// Get certificate output path
export function getCertificatePath(certificateFileName: string): string {
  return path.join(CERTIFICATES_DIR, certificateFileName);
}

// Check if file exists
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}
