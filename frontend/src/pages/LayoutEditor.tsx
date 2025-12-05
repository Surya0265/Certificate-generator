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
  API_BASE_URL,
  BACKEND_BASE_URL,
  getPredefinedTemplates,
  PredefinedTemplate,
} from "../services/api";
import { TemplateEditor } from "../components/TemplateEditor";
import { Layout, TextField, CanvasTextField, Font } from "../types";
import { useAuth } from "../context/AuthContext";
import "./LayoutEditor.css";

// Predefined fields
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PREDEFINED_FIELDS = ["Name", "Event", "College", "Class", "Year"];

const assetUrl = (path: string) =>
  `${BACKEND_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingLayoutData, setPendingLayoutData] = useState<any>(null);
  const [showTemplateSelection, setShowTemplateSelection] = useState(true);
  const [predefinedTemplates, setPredefinedTemplates] = useState<PredefinedTemplate[]>([]);
  const [customFieldInput, setCustomFieldInput] = useState("");

  // Load existing layout if layoutId provided
  useEffect(() => {
    if (layoutId) {
      loadLayout(layoutId);
      setShowTemplateSelection(false);
    } else {
      loadPredefinedTemplates();
    }
  }, [layoutId]);

  const loadPredefinedTemplates = async () => {
    try {
      console.log("Loading predefined templates...");
      const templates = await getPredefinedTemplates();
      console.log("Templates loaded:", templates);
      setPredefinedTemplates(templates);
    } catch (error) {
      console.warn("Failed to load predefined templates", error);
      setPredefinedTemplates([]); // Set empty array so we still show upload option
    }
  };

  const loadLayout = async (id: string) => {
    try {
      setLoading(true);
      const layout = await getLayout(id);
      setLayout(layout);

      if (layout.templateFile) {
        const templateUrl = assetUrl(`/uploads/templates/${layout.templateFile}`);
        setTemplateImage(templateUrl);
      }

      setFonts(layout.fonts);
      
      // Load all fonts as web fonts for preview
      layout.fonts.forEach((font) => {
        const fontUrl = assetUrl(`/uploads/fonts/${font.file}`);
        const fontFace = new FontFace(font.name, `url('${fontUrl}')`, {
          style: "normal",
          weight: "normal",
        });
        
        fontFace.load().then((loadedFont) => {
          document.fonts.add(loadedFont);
          console.log(`Font loaded: ${font.name}`);
        }).catch((error) => {
          console.warn(`Font load warning: ${font.name}`, error);
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
      setTemplateImage(assetUrl(`/uploads/templates/${response.data.fileName}`));
      setShowTemplateSelection(false);
      toast.success("Template uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload template");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPredefinedTemplate = async (template: PredefinedTemplate) => {
    try {
      setLoading(true);
      const templateUrl = assetUrl(`/uploads/templates/${template.fileName}`);
      setTemplateImage(templateUrl);
      setShowTemplateSelection(false);
      toast.success(`Template "${template.templateName}" selected`);
    } catch (error) {
      toast.error("Failed to select template");
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
      const fontUrl = assetUrl(`/uploads/fonts/${response.data.fileName}`);
      const fontFace = new FontFace(fontName, `url('${fontUrl}')`, {
        style: "normal",
        weight: "normal",
      });
      
      fontFace.load().then((loadedFont) => {
        document.fonts.add(loadedFont);
        console.log(`Font loaded: ${fontName}`);
      }).catch((error) => {
        console.warn(`Font load warning: ${fontName}`, error);
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

      // Check if layout with same name exists
      if (!layout?.layoutId) {
        try {
          const response = await fetch(`${API_BASE_URL}/layouts`, {
            headers: {
              "Authorization": `Bearer ${currentUser}`,
            },
          });
          const data = await response.json();
          const existingLayout = (data.data || []).find(
            (l: any) => l.layoutName === eventName && l.createdBy === currentUser
          );

          if (existingLayout) {
            // Store the pending data and show custom dialog
            setPendingLayoutData({
              layoutData: {
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
              },
              existingLayoutId: existingLayout.layoutId,
            });
            setShowConfirmDialog(true);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.warn("Failed to check existing layouts", error);
        }
      }

      // Proceed with save
      await performSaveLayout(currentUser);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save layout");
      console.error(error);
      setLoading(false);
    }
  };

  const performSaveLayout = async (currentUser: string) => {
    try {
      setLoading(true);
      const templateFileName = templateImage.split("/").pop() || "template.png";

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

  const handleConfirmOverwrite = async (confirmed: boolean) => {
    setShowConfirmDialog(false);

    if (!confirmed) {
      setPendingLayoutData(null);
      return;
    }

    try {
      setLoading(true);
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
        toast.error("User session expired");
        setLoading(false);
        return;
      }

      // Delete the existing layout
      await fetch(
        `${API_BASE_URL}/layouts/${pendingLayoutData.existingLayoutId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${currentUser}`,
          },
        }
      );

      // Save new layout
      const savedLayout = await saveLayout(pendingLayoutData.layoutData);
      setLayout(savedLayout);
      toast.success(`Layout saved: ${eventName}`);
      setPendingLayoutData(null);
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

  // Template Selection Modal
  if (showTemplateSelection) {
    return (
      <div className="layout-editor-page">
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "40px",
              maxWidth: "1000px",
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "10px", color: "#1f2937", textAlign: "center" }}>
              Select a Certificate Template
            </h2>
            <p style={{ color: "#6b7280", textAlign: "center", marginBottom: "40px", fontSize: "16px" }}>
              Choose from predefined templates or upload your own
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
              {/* LEFT SIDE: Predefined Templates */}
              <div>
                <h3 style={{ color: "#374151", marginBottom: "20px", textAlign: "center" }}>Predefined Templates</h3>
                {predefinedTemplates.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: "15px",
                    }}
                  >
                    {predefinedTemplates.map((template) => (
                      <div
                        key={template.templateId}
                        style={{
                          border: "2px solid #e5e7eb",
                          borderRadius: "8px",
                          padding: "16px",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          textAlign: "center",
                        }}
                        onClick={() => handleSelectPredefinedTemplate(template)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#3b82f6";
                          e.currentTarget.style.backgroundColor = "#eff6ff";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#e5e7eb";
                          e.currentTarget.style.backgroundColor = "white";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <h4 style={{ margin: "0 0 8px 0", color: "#1f2937", fontSize: "16px", fontWeight: "600" }}>
                          {template.templateName}
                        </h4>
                        {template.description && (
                          <p style={{ margin: "8px 0", color: "#6b7280", fontSize: "14px" }}>
                            {template.description}
                          </p>
                        )}
                        <button
                          style={{
                            marginTop: "12px",
                            padding: "10px 20px",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                            width: "100%",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3b82f6")}
                        >
                          Select
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", color: "#9ca3af", padding: "20px" }}>
                    <p>No predefined templates available</p>
                  </div>
                )}
              </div>

              {/* RIGHT SIDE: Upload Custom Template */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#f9fafb",
                  padding: "40px",
                  borderRadius: "12px",
                  border: "2px dashed #e5e7eb",
                  textAlign: "center",
                  minHeight: "300px",
                }}
              >
                <div style={{ marginBottom: "20px" }}>
                  
                  <h3 style={{ color: "#374151", marginBottom: "8px", margin: "0 0 8px 0" }}>Upload Your Own</h3>
                  <p style={{ color: "#6b7280", margin: "0", fontSize: "14px" }}>
                    Use a custom certificate template
                  </p>
                </div>

                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleTemplateUpload}
                  disabled={loading}
                  style={{
                    display: "none",
                    cursor: "pointer",
                  }}
                  id="template-upload-input"
                />
                <label
                  htmlFor="template-upload-input"
                  style={{
                    display: "inline-block",
                    padding: "14px 28px",
                    backgroundColor: "#10b981",
                    color: "white",
                    borderRadius: "6px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "15px",
                    fontWeight: "600",
                    border: "none",
                    transition: "background-color 0.3s ease",
                    opacity: loading ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) e.currentTarget.style.backgroundColor = "#059669";
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) e.currentTarget.style.backgroundColor = "#10b981";
                  }}
                >
                  {loading ? "Uploading..." : "Choose File"}
                </label>

                <div style={{ marginTop: "20px", color: "#9ca3af", fontSize: "13px" }}>
                  <p style={{ margin: "0 0 8px 0" }}>Supported format</p>
                  <p style={{ margin: 0 }}>PDF</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

          {/* Layout info removed to prevent null reference errors */}

          <div className="section">
            <h3>Change Template</h3>
            <button
              onClick={() => {
                setTemplateImage("");
                setShowTemplateSelection(true);
              }}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#f59e0b",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "15px",
                fontWeight: "500",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d97706")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f59e0b")}
            >
              Select Different Template
            </button>
          </div>

          <div className="section">
            <h3>1. Upload Fonts</h3>
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
            <h3>2. Event Name</h3>
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
            <h3>3. Select Fields</h3>
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
                  <div key={field.id} className="field-item" style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
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
                    {!isConfirmed && (
                      <button
                        onClick={() => handleRemoveField(field.id)}
                        style={{
                          backgroundColor: "#dc2626",
                          color: "white",
                          padding: "6px 10px",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "14px",
                          transition: "background-color 0.3s ease",
                          minWidth: "32px",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#b91c1c")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
                        title="Remove this field"
                      >
                        X
                      </button>
                    )}
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
              {isConfirmed ? "Confirmed" : "Confirm & Lock"}
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
              Upload a certificate template (PDF) to get started
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="bottom-right" />

      {showConfirmDialog && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "30px",
              maxWidth: "400px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              textAlign: "center",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#1f2937" }}>Layout Already Exists</h2>
            <p style={{ color: "#6b7280", fontSize: "16px", marginBottom: "30px" }}>
              A layout named "<strong>{eventName}</strong>" already exists. Do you want to delete it and create a new one?
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
              }}
            >
              <button
                onClick={() => handleConfirmOverwrite(false)}
                disabled={loading}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  backgroundColor: "#f3f4f6",
                  color: "#1f2937",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "background-color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
              >
                No
              </button>
              <button
                onClick={() => handleConfirmOverwrite(true)}
                disabled={loading}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor: "#dc2626",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "background-color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#b91c1c")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
              >
                Yes, Delete & Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
