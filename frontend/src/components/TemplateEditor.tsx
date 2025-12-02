import React, { useCallback, useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import * as pdfjsLib from "pdfjs-dist";
import { CanvasTextField } from "../types";
import "./TemplateEditor.css";

const DEFAULT_CANVAS_WIDTH = 800;
const DEFAULT_CANVAS_HEIGHT = 600;

// Set up PDF.js worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface TemplateEditorProps {
  templateImage: string; // URL or data URL (PNG, JPG, or PDF)
  fields: CanvasTextField[];
  onFieldsChange: (fields: CanvasTextField[]) => void;
  editable: boolean;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  templateImage,
  fields,
  onFieldsChange,
  editable,
}) => {
  type FabricTextboxWithMeta = fabric.Textbox & {
    fieldId?: string;
    fieldName?: string;
    _originalFontSize?: number;
  };
  const wrapperRef = useRef<HTMLDivElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [selectedFontSize, setSelectedFontSize] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
  });
  const [scaleRatio, setScaleRatio] = useState(1);

  const addTextboxToCanvas = useCallback(
    (canvas: fabric.Canvas, field: CanvasTextField) => {
      const textbox = new fabric.Textbox(field.preview || field.name, {
        left: field.x,
        top: field.y,
        width: 240,
        fontSize: field.fontSize,
        fill: field.color || "#1f2937",
        fontFamily: field.fontFamily,
        backgroundColor: "#f3f4f6",
        padding: 12,
        editable: editable,
        hasControls: editable,
        hasBorders: editable,
        selectable: editable,
        borderColor: "#2563eb",
        cornerColor: "#2563eb",
        cornerStyle: "circle",
        cornerSize: 10,
        lockScalingFlip: true,
      }) as FabricTextboxWithMeta;

      textbox.fieldId = field.id;
      textbox.fieldName = field.name;

      canvas.add(textbox);
      canvas.bringToFront(textbox);
      canvas.setActiveObject(textbox);
      canvas.renderAll();

      return textbox;
    },
    [editable]
  );

  const syncFieldsFromCanvas = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objectsById = new Map<string, FabricTextboxWithMeta>();
    canvas.getObjects().forEach((item) => {
      const object = item as FabricTextboxWithMeta;
      if (object.fieldId) {
        objectsById.set(object.fieldId, object);
      }
    });

    if (objectsById.size === 0) {
      return;
    }

    const merged: CanvasTextField[] = fields.map((field) => {
      const object = objectsById.get(field.id);
      if (!object) return field;

      const left = Math.round(object.left ?? field.x);
      const top = Math.round(object.top ?? field.y);
      const fontSize =
        typeof object.fontSize === "number"
          ? Math.round(object.fontSize)
          : field.fontSize;
      const fontFamily =
        (object.fontFamily as string) || field.fontFamily || "Arial";
      const fillColor =
        typeof object.fill === "string" ? object.fill : field.color;

      return {
        ...field,
        x: left,
        y: top,
        fontSize,
        fontFamily,
        color: fillColor || field.color,
        preview: object.text || field.preview || field.name,
      };
    });

    objectsById.forEach((object, fieldId) => {
      if (merged.some((field) => field.id === fieldId)) {
        return;
      }

      const left = Math.round(object.left ?? 0);
      const top = Math.round(object.top ?? 0);
      const fontSize =
        typeof object.fontSize === "number"
          ? Math.round(object.fontSize)
          : 24;
      const fontFamily =
        (object.fontFamily as string) || "Arial";
      const fillColor =
        typeof object.fill === "string" ? object.fill : "#000000";

      merged.push({
        id: fieldId,
        name: object.fieldName || object.text || "Field",
        preview: object.text || object.fieldName || "Field",
        x: left,
        y: top,
        fontSize,
        fontFamily,
        color: fillColor,
      });
    });

    onFieldsChange(merged);
  }, [fields, onFieldsChange]);

  const syncFieldsRef = useRef(syncFieldsFromCanvas);
  useEffect(() => {
    syncFieldsRef.current = syncFieldsFromCanvas;
  }, [syncFieldsFromCanvas]);

  // Initialize Fabric.js canvas ONCE
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: DEFAULT_CANVAS_WIDTH,
      height: DEFAULT_CANVAS_HEIGHT,
      backgroundColor: "rgba(255, 255, 255, 0.01)",
      renderOnAddRemove: true,
    });

    fabricCanvasRef.current = fabricCanvas;

    const onSelectionCreated = (e: any) => {
      if (e.selected && e.selected[0]) {
        const obj = e.selected[0] as FabricTextboxWithMeta;
        setSelectedField(obj.fieldId ?? null);
        setSelectedFontSize(
          typeof obj.fontSize === "number" ? obj.fontSize : null
        );
      }
    };

    const onSelectionCleared = () => {
      setSelectedField(null);
      setSelectedFontSize(null);
    };

    const handleObjectChange = () => {
      syncFieldsRef.current();
    };
    
    const handleObjectScaling = (e: any) => {
      const textbox = e.target as FabricTextboxWithMeta;
      if (textbox && textbox.scaleX && textbox.scaleX !== 1) {
        // Store original font size on first scale
        if (!textbox._originalFontSize) {
          textbox._originalFontSize = textbox.fontSize || 24;
        }
        
        // Adjust font size proportionally with scaling
        const newFontSize = Math.round((textbox._originalFontSize || 24) * textbox.scaleX);
        textbox.set({ fontSize: newFontSize });
        textbox.setCoords();
        fabricCanvasRef.current?.renderAll();
      }
      syncFieldsRef.current();
    };
    
    const handleObjectChangeEnd = (e: any) => {
      const textbox = e.target as FabricTextboxWithMeta;
      if (textbox && textbox.scaleX && textbox.scaleX !== 1) {
        // After scaling ends, apply final font size and reset scale
        const finalFontSize = Math.round((textbox._originalFontSize || 24) * textbox.scaleX);
        textbox.set({ fontSize: finalFontSize, scaleX: 1, scaleY: 1 });
        textbox._originalFontSize = finalFontSize;
        textbox.setCoords();
        fabricCanvasRef.current?.renderAll();
      }
      syncFieldsRef.current();
    };

    fabricCanvas.on("selection:created", onSelectionCreated);
    fabricCanvas.on("selection:cleared", onSelectionCleared);
    fabricCanvas.on("object:moving", handleObjectChange);
    fabricCanvas.on("object:scaling", handleObjectScaling);
    fabricCanvas.on("object:modified", handleObjectChangeEnd);
    fabricCanvas.on("object:added", handleObjectChangeEnd);
    fabricCanvas.on("object:removed", handleObjectChangeEnd);

    return () => {
      fabricCanvas.off("selection:created", onSelectionCreated);
      fabricCanvas.off("selection:cleared", onSelectionCleared);
      fabricCanvas.off("object:moving", handleObjectChange);
      fabricCanvas.off("object:scaling", handleObjectScaling);
      fabricCanvas.off("object:modified", handleObjectChangeEnd);
      fabricCanvas.off("object:added", handleObjectChangeEnd);
      fabricCanvas.off("object:removed", handleObjectChangeEnd);
      fabricCanvas.dispose();
    };
  }, []);

  // Update canvas size when it changes
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    console.log("Resizing canvas to", canvasSize.width, "x", canvasSize.height);
    fabricCanvasRef.current.setWidth(canvasSize.width);
    fabricCanvasRef.current.setHeight(canvasSize.height);
    fabricCanvasRef.current.renderAll();
  }, [canvasSize]);

  // Sync canvas objects with current fields
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const existingById = new Map<string, FabricTextboxWithMeta>();

    canvas.getObjects().forEach((obj) => {
      const textbox = obj as FabricTextboxWithMeta;
      if (textbox.fieldId) {
        existingById.set(textbox.fieldId, textbox);
      }
    });

    existingById.forEach((obj, fieldId) => {
      if (!fields.some((field) => field.id === fieldId)) {
        canvas.remove(obj);
      }
    });

    fields.forEach((field) => {
      const existing = existingById.get(field.id);
      if (existing) {
        existing.fieldId = field.id;
        existing.fieldName = field.name;
        existing.set({
          text: field.preview || field.name,
          left: field.x,
          top: field.y,
          fontSize: field.fontSize,
          fontFamily: field.fontFamily,
          fill: field.color || "#1f2937",
          backgroundColor: "#f3f4f6",
          editable: editable,
          selectable: editable,
          hasControls: editable,
          hasBorders: editable,
          borderColor: "#2563eb",
          cornerColor: "#2563eb",
          cornerStyle: "circle",
          cornerSize: 10,
          lockScalingFlip: true,
        });
        existing.setCoords();
      } else {
        addTextboxToCanvas(canvas, field);
      }
    });

    canvas.renderAll();
  }, [fields, editable, addTextboxToCanvas]);

  // Load template image/PDF when it changes
  useEffect(() => {
    if (!templateImage) return;

    if (templateImage.toLowerCase().endsWith(".pdf")) {
      loadPdfAsBackground(templateImage);
    } else {
      loadImageAsBackground(templateImage);
    }
  }, [templateImage]);

  useEffect(() => {
    if (!selectedField) return;
    const field = fields.find((f) => f.id === selectedField);
    if (field) {
      setSelectedFontSize(field.fontSize);
    }
  }, [selectedField, fields]);

  useEffect(() => {
    if (!selectedField) return;
    if (!fields.some((field) => field.id === selectedField)) {
      setSelectedField(null);
      setSelectedFontSize(null);
    }
  }, [fields, selectedField]);

  const loadImageAsBackground = (imageUrl: string) => {
    console.log("Loading image:", imageUrl);

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      console.log("Image loaded, size:", img.width, "x", img.height);

      const bgCanvas = backgroundCanvasRef.current;
      if (!bgCanvas) {
        console.error("Background canvas not found");
        return;
      }

      const maxWidth = DEFAULT_CANVAS_WIDTH;
      const scaleFactor = maxWidth / img.width;
      const scaledHeight = img.height * scaleFactor;

      bgCanvas.width = maxWidth;
      bgCanvas.height = Math.round(scaledHeight);
      
      const ctx = bgCanvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, maxWidth, scaledHeight);
        console.log("Image drawn on background canvas");
      }

      setCanvasSize({ width: maxWidth, height: Math.round(scaledHeight) });
    };

    img.onerror = (e) => {
      console.error("Image load error:", e);
    };

    img.src = imageUrl;
  };

  const loadPdfAsBackground = async (pdfUrl: string) => {
    try {
      console.log("Loading PDF:", pdfUrl);

      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const pdfData = await response.arrayBuffer();
      console.log("PDF fetched:", pdfData.byteLength, "bytes");

      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      const page = await pdf.getPage(1);

      // Get actual PDF page size (in points, 1/72 inch)
      const viewport = page.getViewport({ scale: 1 });
      const pageWidth = viewport.width; // e.g., 612 (8.5 inches)
      const pageHeight = viewport.height; // e.g., 792 (11 inches)
      
      // Calculate scale ratio: same as backend (pageWidth / 800)
      const baseWidth = 800;
      const calculatedScaleRatio = pageWidth / baseWidth;
      setScaleRatio(calculatedScaleRatio);
      console.log(`PDF dimensions: ${pageWidth}x${pageHeight}, scale ratio: ${calculatedScaleRatio}`);

      const scale = 2;
      const scaledViewport = page.getViewport({ scale });
      console.log("Viewport:", scaledViewport.width, "x", scaledViewport.height);

      // Create PDF render canvas
      const pdfCanvas = document.createElement("canvas");
      pdfCanvas.width = scaledViewport.width;
      pdfCanvas.height = scaledViewport.height;

      const pdfCtx = pdfCanvas.getContext("2d")!;
      await page.render({
        canvasContext: pdfCtx,
        viewport: scaledViewport,
      }).promise;

      console.log("PDF rendered to temp canvas");

      // Draw to background canvas
      const bgCanvas = backgroundCanvasRef.current;
      if (!bgCanvas) {
        console.error("Background canvas not found");
        return;
      }

      const maxWidth = DEFAULT_CANVAS_WIDTH;
      const scaleFactor = maxWidth / scaledViewport.width;
      const scaledHeight = scaledViewport.height * scaleFactor;

      bgCanvas.width = maxWidth;
      bgCanvas.height = Math.round(scaledHeight);
      
      const bgCtx = bgCanvas.getContext("2d");
      if (bgCtx) {
        bgCtx.drawImage(pdfCanvas, 0, 0, maxWidth, scaledHeight);
        console.log("PDF drawn on background canvas");
      }

      // Update Fabric canvas size to match
      setCanvasSize({ width: maxWidth, height: Math.round(scaledHeight) });
    } catch (error) {
      console.error("Error loading PDF:", error);
    }
  };

  const getTextboxByFieldId = (fieldId: string) => {
    if (!fabricCanvasRef.current) return null;
    const match = (fabricCanvasRef.current.getObjects() as fabric.Object[]).find(
      (obj) => (obj as FabricTextboxWithMeta).fieldId === fieldId
    );
    return (match as FabricTextboxWithMeta) || null;
  };

  const handleFontSizeChange = (value: number) => {
    if (!selectedField || !fabricCanvasRef.current) return;

    if (!Number.isFinite(value)) return;
    const bounded = Math.max(8, Math.min(200, Math.round(value)));
    const textbox = getTextboxByFieldId(selectedField);
    if (textbox) {
      textbox.set({ fontSize: bounded });
      textbox.setCoords();
      fabricCanvasRef.current.renderAll();
    }

    const updated = fields.map((field) =>
      field.id === selectedField ? { ...field, fontSize: bounded } : field
    );
    onFieldsChange(updated);
    setSelectedFontSize(bounded);
  };

  return (
    <div className="template-editor">
      <div className="editor-header">
        <h2>Template Layout Editor</h2>
      </div>
      <div className="canvas-container" ref={wrapperRef}>
        <div
          className="canvas-stack"
          style={{ 
            width: `${canvasSize.width}px`, 
            height: `${canvasSize.height}px`,
            transform: `scale(${scaleRatio})`,
            transformOrigin: "top left",
            transformBox: "border-box",
          }}
        >
          {/* Background canvas with PDF/Image - visible */}
          <canvas
            ref={backgroundCanvasRef}
            className="canvas-layer background-layer"
          />
          {/* Fabric canvas for text fields - overlay on top */}
          <canvas
            ref={canvasRef}
            className="canvas-layer fabric-layer"
            style={{ cursor: editable ? "crosshair" : "default" }}
          />
        </div>
      </div>
    </div>
  );
};
