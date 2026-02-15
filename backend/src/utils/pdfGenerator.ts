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
 * 
 * College: Always 25px, 35 char limit, complex reduction tiers
 * Other fields: Use DB font size, 30 char limit, simple proportional reduction
 */
function calculateAdaptiveFontSize(
  fieldName: string,
  text: string,
  baseFontSize: number
): number {
  if (fieldName === "College") {
    // ALWAYS use 25px for College (ignore baseFontSize from DB)
    const collegeFontSize = 25;
    const collegeLength = text.length;
    const maxLength = 30;

    // If fits within 30 chars, use 25px
    if (collegeLength <= maxLength) {
      return collegeFontSize;
    }

    // Apply aggressive tiered reduction for College (baseline: 30 chars)
    const excess = collegeLength - maxLength;
    let adjustedSize = collegeFontSize;

    if (excess <= 10) {
      // 31-40 chars: moderate reduction
      adjustedSize = Math.max(collegeFontSize - excess * 1.0, 16);
    } else if (excess <= 20) {
      // 41-50 chars: stronger reduction
      adjustedSize = Math.max(collegeFontSize - excess * 1.1, 13);
    } else if (excess <= 30) {
      // 51-60 chars: aggressive reduction
      adjustedSize = Math.max(collegeFontSize - excess * 1.2, 10);
    } else {
      // 61+ chars: very aggressive
      adjustedSize = Math.max(collegeFontSize - excess * 1.3, 8);
    }

    return adjustedSize;
  }

  // For all other fields (Name, Event, etc.)
  const maxLength = 30;
  const textLength = text.length;

  // If text fits, use DB font size
  if (textLength <= maxLength) {
    return baseFontSize;
  }

  // Proportional reduction
  const excessChars = textLength - maxLength;
  const reductionFactor = baseFontSize / maxLength;
  const adjustedSize = baseFontSize - (excessChars * reductionFactor);

  // Minimum: 60% of base size or 10px
  const minSize = Math.max(baseFontSize * 0.6, 10);

  return Math.max(adjustedSize, minSize);
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
    console.log(`[PDF] Attempting to load font: ${firstFont.name} from ${fontPath}`);

    if (fs.existsSync(fontPath)) {
      try {
        const fontBytes = fs.readFileSync(fontPath);
        console.log(`[PDF] Font bytes read: ${fontBytes.length}`);

        defaultFont = await outputDoc.embedFont(fontBytes, { subset: true });
        console.log(`[PDF] Font embedded successfully: ${firstFont.name}`);
      } catch (err) {
        console.error(`[PDF] Failed to embed font ${firstFont.name}:`, err);
        // Do not fallback immediately, let it fall through to default check
      }
    } else {
      console.warn(`[PDF] Font file not found at path: ${fontPath}`);
    }
  }

  // Fallback to standard font if no custom font
  if (!defaultFont) {
    console.log("[PDF] Using fallback Helvetica font");
    defaultFont = await outputDoc.embedFont(StandardFonts.Helvetica);
  }

  for (const field of layout.fields) {
    const textValue = data[field.name];
    if (!textValue) {
      continue;
    }

    // Get the original base font size for Y positioning
    const baseFontSize = field.fontSize || 24;

    // Calculate adaptive font size based on text length
    let adaptiveFontSize = calculateAdaptiveFontSize(
      field.name,
      textValue,
      baseFontSize
    );

    // Special handling for Name/Event specifically for long names
    if ((field.name === "Name" || field.name === "Event") && textValue.length > 20) {
      // Even smoother reduction for names/events
      const excess = textValue.length - 20;
      // Reduce by 0.5px per character over 20
      adaptiveFontSize = Math.max(baseFontSize - excess * 0.8, 12);
    }

    const scaledFontSize = adaptiveFontSize * scaleRatio;
    const scaledBaseFontSize = baseFontSize * scaleRatio; // Use original size for Y positioning
    const scaledX = (field.x || 0) * scaleRatio;
    const scaledYFromTop = (field.y || 0) * scaleRatio;
    let drawX = scaledX;

    const textWidth = defaultFont.widthOfTextAtSize(textValue, scaledFontSize);
    const alignment = field.alignment || "left";

    // Adjust X position for long names/events to "start from left too" (shift left to center/balance)
    if ((field.name === "Name" || field.name === "Event") && textValue.length > 20) {
      // Shift left by a larger amount proportional to excess length
      // e.g. shift 5px left per excess char
      const shiftAmount = (textValue.length - 20) * 5 * scaleRatio;
      drawX = drawX - shiftAmount;
    }

    if (alignment === "center") {
      drawX = drawX - textWidth / 2;
    } else if (alignment === "right") {
      drawX = drawX - textWidth;
    }

    // Use base font size for Y calculation to maintain consistent baseline position
    const drawY = pageHeight - scaledYFromTop - scaledBaseFontSize;
    let colorRgb = parseColor(field.color);

    // Force white text for Infinitum templates
    if (layout.templateFile.toLowerCase().includes("infinitum")) {
      colorRgb = rgb(1, 1, 1);
    }

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
