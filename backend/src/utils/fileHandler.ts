import fs from "fs";
import path from "path";
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
    LAYOUTS_DIR,
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

// Load layout from JSON file
export function loadLayout(layoutId: string): Layout | null {
  try {
    const filePath = path.join(LAYOUTS_DIR, `${layoutId}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading layout ${layoutId}:`, error);
    return null;
  }
}

// Save layout to JSON file
export function saveLayout(layout: Layout): boolean {
  try {
    const filePath = path.join(LAYOUTS_DIR, `${layout.layoutId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(layout, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error(`Error saving layout:`, error);
    return false;
  }
}

// List all layouts
export function listLayouts(): Layout[] {
  try {
    const files = fs.readdirSync(LAYOUTS_DIR);
    const layouts: Layout[] = [];

    files.forEach((file) => {
      if (file.endsWith(".json")) {
        const layout = loadLayout(file.replace(".json", ""));
        if (layout) {
          layouts.push(layout);
        }
      }
    });

    return layouts;
  } catch (error) {
    console.error("Error listing layouts:", error);
    return [];
  }
}

// Delete layout
export function deleteLayout(layoutId: string): boolean {
  try {
    const filePath = path.join(LAYOUTS_DIR, `${layoutId}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
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
