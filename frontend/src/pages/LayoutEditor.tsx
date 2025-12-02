import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  uploadTemplate,
  uploadFont,
  saveLayout,
  confirmLayout,
  getLayout,
  updateLayout,
} from "../services/api";
import { TemplateEditor } from "../components/TemplateEditor";
import { Layout, TextField, CanvasTextField, Font } from "../types";
import { useAuth } from "../context/AuthContext";
import "./LayoutEditor.css";

// Predefined fields
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PREDEFINED_FIELDS = ["Name", "Event", "College", "Class", "Year"];

export const LayoutEditor: React.FC = () => {
  const { layoutId } = useParams<{ layoutId?: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [layout, setLayout] = useState<Layout | null>(null);
  const [loading, setLoading] = useState(false);
  const [templateImage, setTemplateImage] = useState<string>("");
  const [fields, setFields] = useState<CanvasTextField[]>([]);
  const [fonts, setFonts] = useState<Font[]>([]);
  const [eventName, setEventName] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  // Load existing layout if layoutId provided
  useEffect(() => {
    if (layoutId) {
      loadLayout(layoutId);
    }
  }, [layoutId]);

  const loadLayout = async (id: string) => {
    try {
      setLoading(true);
      const layout = await getLayout(id);
      setLayout(layout);

      if (layout.templateFile) {
        const templateUrl = `http://localhost:3001/uploads/templates/${layout.templateFile}`;
        setTemplateImage(templateUrl);
      }

      setFonts(layout.fonts);
      
      // Load all fonts as web fonts for preview
      layout.fonts.forEach((font) => {
        const fontUrl = `http://localhost:3001/uploads/fonts/${font.file}`;
        const fontFace = new FontFace(font.name, `url('${fontUrl}')`, {
          style: "normal",
          weight: "normal",
        });
        
        fontFace.load().then((loadedFont) => {
          document.fonts.add(loadedFont);
          console.log(`✅ Font loaded: ${font.name}`);
        }).catch((error) => {
          console.warn(`⚠️ Font load warning: ${font.name}`, error);
        });
      });
      
      setFields(
        layout.fields.map((f: TextField, idx: number) => ({
          ...f,
          id: f.name + idx,
          preview: f.name,
        }))
      );
      setSelectedFields(layout.fields.map((f: TextField) => f.name));
      setEventName(layout.layoutName || "");
    } catch (error) {
      toast.error("Failed to load layout");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const response = await uploadTemplate(file);
      setTemplateImage(
        `http://localhost:3001/uploads/templates/${response.data.fileName}`
      );
      toast.success("Template uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload template");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFontUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const response = await uploadFont(file);
      const fontName = file.name.replace(/\.[^.]+$/, ""); // Remove extension
      const newFont: Font = {
        name: fontName,
        file: response.data.fileName,
      };
      
      // Load font as web font for preview
      const fontUrl = `http://localhost:3001/uploads/fonts/${response.data.fileName}`;
      const fontFace = new FontFace(fontName, `url('${fontUrl}')`, {
        style: "normal",
        weight: "normal",
      });
      
      fontFace.load().then((loadedFont) => {
        document.fonts.add(loadedFont);
        console.log(`✅ Font loaded: ${fontName}`);
      }).catch((error) => {
        console.warn(`⚠️ Font load warning: ${fontName}`, error);
      });
      
      setFonts([...fonts, newFont]);
      toast.success("Font uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload font");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleField = (fieldName: string) => {
    if (selectedFields.includes(fieldName)) {
      setSelectedFields(selectedFields.filter((f) => f !== fieldName));
      setFields(fields.filter((f) => f.name !== fieldName));
    } else {
      setSelectedFields([...selectedFields, fieldName]);
      const newField: CanvasTextField = {
        id: `field_${fieldName}_${Date.now()}`,
        name: fieldName,
        x: 100 + selectedFields.length * 50,
        y: 100 + selectedFields.length * 50,
        fontSize: fieldName === "Name" || fieldName === "College" ? 36 : 24,
        fontFamily: fonts[0]?.name || "Arial",
        color: "#000000",
        preview: fieldName,
      };
      setFields([...fields, newField]);
    }
  };

  const handleSaveLayout = async () => {
    if (!templateImage) {
      toast.error("Please upload a template image first");
      return;
    }

    if (!eventName.trim()) {
      toast.error("Please enter Event name");
      return;
    }

    if (fields.length === 0) {
      toast.error("Please select at least one field");
      return;
    }

    try {
      setLoading(true);
      const templateFileName = templateImage.split("/").pop() || "template.png";
      const currentUser =
        user?.username ||
        (() => {
          try {
            const stored = localStorage.getItem("user");
            if (stored) {
              const parsed = JSON.parse(stored);
              return parsed.username as string | undefined;
            }
          } catch (error) {
            console.warn("Failed to parse stored user", error);
          }
          return undefined;
        })();

      if (!currentUser) {
        toast.error("User session expired. Please log in again.");
        setLoading(false);
        navigate("/login");
        return;
      }

      const layoutData = {
        layoutId: layout?.layoutId,
        layoutName: eventName,
        templateFile: templateFileName,
        fonts,
        fields: fields.map((f) => ({
          name: f.name,
          x: f.x,
          y: f.y,
          fontSize: f.fontSize,
          fontFamily: f.fontFamily,
          color: f.color,
          alignment: f.alignment,
        })),
        createdBy: currentUser,
      };

      if (layout && layout.layoutId) {
        await updateLayout(layout.layoutId, layoutData);
        toast.success("Layout updated successfully");
      } else {
        const savedLayout = await saveLayout(layoutData);
        setLayout(savedLayout);
        toast.success(`Layout saved: ${eventName}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save layout");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLayout = async () => {
    if (!layout) {
      toast.error("Save layout first");
      return;
    }

    try {
      setLoading(true);
      const confirmed = await confirmLayout(layout.layoutId);
      setLayout(confirmed);
      toast.success("Layout confirmed and locked for generation");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to confirm layout");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRemoveField = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId));
  };

  if (loading && !layout && !templateImage) {
    return <div className="loading">Loading...</div>;
  }

  const isConfirmed = layout?.confirmed || false;
  const lastUpdatedLabel = layout?.updatedAt
    ? new Date(layout.updatedAt).toLocaleString()
    : "Just now";

  return (
    <div className="layout-editor-page">
      <div className="editor-container">
        <div className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title">
              <h1>Certificate Studio</h1>
              <p>Design, fine-tune, and preview your printable layouts.</p>
            </div>
            <div className="header-actions">
              <button
                onClick={() => navigate("/test")}
                className="action-btn action-btn--ghost"
              >
                Preview
              </button>
              <button
                onClick={handleLogout}
                className="action-btn action-btn--danger"
              >
                Logout
              </button>
            </div>
          </div>

          {layout && (
            <div className="layout-info">
              <div className="layout-pill-group">
                <span className="layout-pill">
                  {layout.layoutName || layout.layoutId}
                </span>
                <span
                  className={`layout-status layout-status--${isConfirmed ? "confirmed" : "draft"}`}
                >
                  {isConfirmed ? "Confirmed" : "Draft"}
                </span>
              </div>
              {layout.createdBy && (
                <p className="layout-meta">Created by {layout.createdBy}</p>
              )}
              <p className="layout-meta">Last updated {lastUpdatedLabel}</p>
            </div>
          )}

          <div className="section">
            <h3>1. Upload Template</h3>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={handleTemplateUpload}
              disabled={isConfirmed || loading}
              className="file-input"
            />
            {templateImage && (
              <p className="success-text">✓ Template loaded</p>
            )}
          </div>

          <div className="section">
            <h3>2. Upload Fonts</h3>
            <input
              type="file"
              accept=".ttf"
              onChange={handleFontUpload}
              disabled={isConfirmed || loading}
              className="file-input"
            />
            {fonts.length > 0 && (
              <div className="fonts-list">
                {fonts.map((font, idx) => (
                  <div key={idx} className="font-item">
                    {font.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="section">
            <h3>3. Event Name</h3>
            <input
              type="text"
              placeholder="e.g., Annual Awards 2024"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              disabled={isConfirmed}
              className="file-input"
              style={{ marginBottom: "12px" }}
            />
          </div>

          <div className="section">
            <h3>4. Select Fields</h3>
            <div className="field-list">
              {PREDEFINED_FIELDS.map((fieldName) => (
                <label
                  key={fieldName}
                  className={`field-toggle ${isConfirmed ? "field-toggle--disabled" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(fieldName)}
                    onChange={() => toggleField(fieldName)}
                    disabled={isConfirmed}
                    className="field-toggle__checkbox"
                  />
                  <span className="field-toggle__label">{fieldName}</span>
                </label>
              ))}
            </div>
          </div>

          {fields.length > 0 && (
            <div className="section">
              <h3>Selected Fields</h3>
              <div className="fields-list">
                {fields.map((field) => (
                  <div key={field.id} className="field-item">
                    <div className="field-name">{field.name}</div>
                    <div className="field-coords">
                      x: {field.x}, y: {field.y}
                    </div>
                    <div className="field-props">
                      <span>Font: {field.fontFamily}</span>
                      {!isConfirmed ? (
                        <label className="field-size-input">
                          Size
                          <input
                            type="number"
                            min={8}
                            max={200}
                            value={field.fontSize}
                            onChange={(e) => {
                              const updatedFields = fields.map((f) =>
                                f.id === field.id
                                  ? { ...f, fontSize: Number(e.target.value) }
                                  : f
                              );
                              setFields(updatedFields);
                            }}
                          />
                        </label>
                      ) : (
                        <span>{field.fontSize}px</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="actions">
            <button
              onClick={handleSaveLayout}
              disabled={loading || isConfirmed}
              className="btn-primary"
            >
              {loading ? "Saving..." : "Save Layout"}
            </button>
            <button
              onClick={handleConfirmLayout}
              disabled={loading || !layout || isConfirmed}
              className="btn-secondary"
              style={{
                background: isConfirmed
                  ? "#d1d5db"
                  : "linear-gradient(135deg, #10b981, #059669)",
              }}
            >
              {isConfirmed ? "✓ Confirmed" : "Confirm & Lock"}
            </button>
          </div>

          {isConfirmed && (
            <div className="confirmation-message">
              <p>Layout is locked. Edit template or upload new one to make changes.</p>
            </div>
          )}
        </div>

        <div className="main-content">
          {templateImage ? (
            <TemplateEditor
              templateImage={templateImage}
              fields={fields}
              onFieldsChange={setFields}
              editable={!isConfirmed}
            />
          ) : (
            <div className="placeholder">
              Upload a certificate template (PDF, PNG, JPG) to get started
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};
