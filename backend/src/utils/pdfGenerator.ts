import PDFDocument from "pdfkit";
import { PDFDocument as PdfLibDocument, rgb, StandardFonts, PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
import { Layout, TextField } from "../types";
import { getTemplatePath, getFontPath } from "./fileHandler";

interface TextOptions {
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontPath: string;
  bold?: boolean;
  italic?: boolean;
  alignment?: "left" | "center" | "right";
}

/**
 * Load font and return font path or use default
 */
function resolveFontPath(
  fontFamily: string,
  layout: Layout
): string | undefined {
  const font = layout.fonts.find((f) => f.name === fontFamily);
  if (font) {
    const fontPath = getFontPath(font.file);
    if (fs.existsSync(fontPath)) {
      return fontPath;
    }
  }
  return undefined;
}

/**
 * Calculate auto-adjusted font size based on text length
 * For Name and College fields only
 */
function calculateAdaptiveFontSize(
  fieldName: string,
  text: string,
  baseFontSize: number
): number {
  // Only apply to Name and College fields
  if (fieldName === "Name") {
    // adjustText logic: max 35 chars, base 25px, min 18px
    const maxLength = 35;
    const minSize = 18;
    return text.length > maxLength
      ? Math.max(baseFontSize - (text.length - maxLength) * 1.2, minSize)
      : baseFontSize;
  }

  if (fieldName === "College") {
    // adjustCollege logic based on length ranges
    const collegeLength = text.length;
    let adjustedSize = baseFontSize;

    if (collegeLength >= 40 && collegeLength < 49) {
      // adjustCollege: max 35, base 24, min 18
      adjustedSize = Math.max(baseFontSize - (collegeLength - 35) * 0.8, 18);
    } else if (collegeLength >= 49 && collegeLength < 60) {
      // adjustCollege: max 15, base 24, min 14
      adjustedSize = Math.max(baseFontSize - (collegeLength - 15) * 0.8, 14);
    } else if (collegeLength >= 60 && collegeLength < 70) {
      // adjustagainCollege: max 12, base 24, min 11
      adjustedSize = Math.max(baseFontSize - (collegeLength - 12) * 1.2, 11);
    } else if (collegeLength >= 70) {
      // adjustCollege: max 35, base 24, min 9
      adjustedSize = Math.max(baseFontSize - (collegeLength - 35) * 0.8, 9);
    }

    return adjustedSize;
  }

  // For other fields, use base font size
  return baseFontSize;
}

/**
 * Generate certificate PDF with dynamic text overlay
 */
export async function generateCertificatePDF(
  layout: Layout,
  data: Record<string, string>
): Promise<Buffer> {
  const templatePath = getTemplatePath(layout.templateFile);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template file not found: ${templatePath}`);
  }

  const extension = path.extname(templatePath).toLowerCase();

  if (extension === ".pdf") {
    return generateFromPdfTemplate(layout, data, templatePath);
  }

  return generateFromImageTemplate(layout, data, templatePath);
}

async function generateFromPdfTemplate(
  layout: Layout,
  data: Record<string, string>,
  templatePath: string
): Promise<Buffer> {
  const templateBytes = fs.readFileSync(templatePath);
  const templateDoc = await PdfLibDocument.load(templateBytes);
  const outputDoc = await PdfLibDocument.create();

  // Register fontkit for custom font support
  outputDoc.registerFontkit(fontkit);

  const [templatePage] = await outputDoc.copyPages(templateDoc, [0]);
  const page = outputDoc.addPage(templatePage);

  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();
  const baseWidth = 800; // matches editor scaling
  const scaleRatio = pageWidth / baseWidth;

  // Use the first uploaded font for all fields (if available)
  let defaultFont: PDFFont | undefined;
  if (layout.fonts.length > 0) {
    const firstFont = layout.fonts[0];
    const fontPath = getFontPath(firstFont.file);
    if (fs.existsSync(fontPath)) {
      const fontBytes = fs.readFileSync(fontPath);
      defaultFont = await outputDoc.embedFont(fontBytes, { subset: true });
    }
  }

  // Fallback to standard font if no custom font
  if (!defaultFont) {
    defaultFont = await outputDoc.embedFont(StandardFonts.Helvetica);
  }

  for (const field of layout.fields) {
    const textValue = data[field.name];
    if (!textValue) {
      continue;
    }

    // Calculate adaptive font size based on text length
    const adaptiveFontSize = calculateAdaptiveFontSize(
      field.name,
      textValue,
      field.fontSize || 24
    );

    const scaledFontSize = adaptiveFontSize * scaleRatio;
    const scaledX = (field.x || 0) * scaleRatio;
    const scaledYFromTop = (field.y || 0) * scaleRatio;
    let drawX = scaledX;

    const textWidth = defaultFont.widthOfTextAtSize(textValue, scaledFontSize);
    const alignment = field.alignment || "left";
    if (alignment === "center") {
      drawX = drawX - textWidth / 2;
    } else if (alignment === "right") {
      drawX = drawX - textWidth;
    }

    const drawY = pageHeight - scaledYFromTop - scaledFontSize;
    const colorRgb = parseColor(field.color);

    page.drawText(textValue, {
      x: drawX,
      y: drawY,
      size: scaledFontSize,
      font: defaultFont,
      color: colorRgb,
    });
  }

  const pdfBytes = await outputDoc.save();
  return Buffer.from(pdfBytes);
}

function parseColor(color?: string) {
  const fallback = rgb(0, 0, 0);
  if (!color) {
    return fallback;
  }

  const hex = color.replace("#", "");
  if (hex.length !== 6) {
    return fallback;
  }

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  if ([r, g, b].some((val) => Number.isNaN(val))) {
    return fallback;
  }

  return rgb(r / 255, g / 255, b / 255);
}

async function resolvePdfLibFont(
  cache: Map<string, PDFFont>,
  doc: PdfLibDocument,
  fontFamily: string,
  layout: Layout
): Promise<PDFFont> {
  if (cache.has(fontFamily)) {
    return cache.get(fontFamily)!;
  }

  let embeddedFont: PDFFont | undefined;
  const font = layout.fonts.find((f) => f.name === fontFamily);
  if (font) {
    const fontPath = getFontPath(font.file);
    if (fs.existsSync(fontPath)) {
      const fontBytes = fs.readFileSync(fontPath);
      embeddedFont = await doc.embedFont(fontBytes, { subset: true });
    }
  }

  if (!embeddedFont) {
    embeddedFont = await doc.embedFont(StandardFonts.Helvetica);
  }

  cache.set(fontFamily, embeddedFont);
  return embeddedFont;
}

function generateFromImageTemplate(
  layout: Layout,
  data: Record<string, string>,
  templatePath: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        bufferPages: true,
        margin: 0,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const imageSize = { width: 800, height: 600 };
      doc.image(templatePath, 0, 0, {
        width: imageSize.width,
        height: imageSize.height,
      });

      layout.fields.forEach((field: TextField) => {
        const textValue = data[field.name] || "";
        if (textValue) {
          addTextToDocument(doc, textValue, field, layout, imageSize);
        }
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Add text field to PDF document
 */
function addTextToDocument(
  doc: PDFKit.PDFDocument,
  text: string,
  field: TextField,
  layout: Layout,
  imageSize: { width: number; height: number }
): void {
  try {
    const fontPath = resolveFontPath(field.fontFamily, layout);

    // Register font if available
    if (fontPath) {
      const fontName = `custom-${field.fontFamily}`;
      try {
        doc.registerFont(fontName, fontPath);
        doc.font(fontName);
      } catch (err) {
        console.warn(`Could not register font ${field.fontFamily}:`, err);
        doc.font("Helvetica");
      }
    } else {
      doc.font("Helvetica");
    }

    // Calculate adaptive font size
    const adaptiveFontSize = calculateAdaptiveFontSize(
      field.name,
      text,
      field.fontSize
    );

    // Set text properties
    doc.fontSize(adaptiveFontSize);
    doc.fillColor(field.color || "#000000");

    // Determine text alignment
    const alignment: "left" | "center" | "right" = field.alignment || "left";

    // Add text to document
    doc.text(text, field.x, field.y, {
      width: imageSize.width - field.x - 20,
      align: alignment,
    });
  } catch (error) {
    console.error(`Error adding text field ${field.name}:`, error);
  }
}

/**
 * Generate certificate and save to file
 */
export async function generateAndSaveCertificate(
  layout: Layout,
  data: Record<string, string>,
  outputFileName: string,
  outputPath: string
): Promise<string> {
  try {
    const pdfBuffer = await generateCertificatePDF(layout, data);
    const filePath = path.join(outputPath, outputFileName);

    fs.writeFileSync(filePath, pdfBuffer);
    return filePath;
  } catch (error) {
    throw new Error(`Failed to generate certificate: ${error}`);
  }
}
