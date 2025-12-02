import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";
import "./TestPage.css";

export const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [layouts, setLayouts] = useState<any[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<string>("");
  const [selectedLayoutData, setSelectedLayoutData] = useState<any>(null);
  const [testData, setTestData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [layouts_loading, setLayoutsLoading] = useState(true);

  // Load all layouts on component mount
  useEffect(() => {
    if (user?.username) {
      loadLayouts();
    }
  }, [user?.username]);

  // When layout is selected, load its fields
  useEffect(() => {
    if (selectedLayout) {
      const layout = layouts.find((l) => l.layoutId === selectedLayout);
      if (layout) {
        setSelectedLayoutData(layout);
        // Initialize testData with only the fields in this layout
        const fields: Record<string, string> = {};
        layout.fields.forEach((field: any) => {
          fields[field.name] = "";
        });
        setTestData(fields);
      }
    }
  }, [selectedLayout, layouts]);

  const loadLayouts = async () => {
    if (!user?.username) {
      return;
    }

    try {
      setLayoutsLoading(true);
      const response = await fetch("http://localhost:3001/api/layouts", {
        headers: {
          "Authorization": `Bearer ${user?.username}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch layouts");
      const data = await response.json();
      const confirmedLayouts = (data.data || []).filter((l: any) => 
        l.confirmed && l.createdBy === user?.username
      );
      setLayouts(confirmedLayouts);
      
      if (confirmedLayouts.length > 0) {
        setSelectedLayout(confirmedLayouts[0].layoutId);
      }
    } catch (error) {
      toast.error("Failed to load layouts");
      console.error(error);
    } finally {
      setLayoutsLoading(false);
    }
  };

  const handleTestDataChange = (field: string, value: string) => {
    setTestData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGenerateCertificate = async () => {
    if (!selectedLayout) {
      toast.error("Please select a layout");
      return;
    }

    if (!testData.Name || testData.Name.trim() === "") {
      toast.error("Please enter Name (required)");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:3001/api/certificates/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            layoutId: selectedLayout,
            data: testData,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate certificate");
      }

      // Get filename from content-disposition header
      const contentDisposition = response.headers.get("content-disposition");
      const headerFileName =
        response.headers.get("X-Certificate-Filename") ||
        response.headers.get("x-certificate-filename");
      let fileName = headerFileName || "certificate.pdf";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) {
          fileName = match[1];
        }
      }

      // Download PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Certificate generated: ${fileName}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate certificate");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      handleGenerateCertificate();
    }
  };

  if (layouts_loading) {
    return <div className="loading">Loading layouts...</div>;
  }

  if (layouts.length === 0) {
    return (
      <div className="test-page">
        <div className="test-container">
          <div className="test-header">
            <h1>Certificate Test</h1>
            <button
              onClick={() => navigate("/")}
              className="test-nav-button improved-back-button"
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#45a049")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4CAF50")}
            >
              ← Back to Studio
            </button>
          </div>
          <div className="empty-state">
            <p>No confirmed layouts available for testing.</p>
            <p>Please create and confirm a layout first.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="test-page" onKeyPress={handleKeyPress}>
      <div className="test-container">
        <div className="test-header">
          <div className="test-header-content">
            <img src="/logo.png" alt="Certificate Studio" className="test-logo" />
            <h1>Certificate Test</h1>
          </div>
          <button
            onClick={() => navigate("/")}
            className="test-nav-button improved-back-button"
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#45a049")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4CAF50")}
          >
            ← Back to Studio
          </button>
        </div>

        <div className="test-section">
          <h3>Select Layout</h3>
          <select
            value={selectedLayout}
            onChange={(e) => setSelectedLayout(e.target.value)}
            className="test-select"
            disabled={loading}
          >
            <option value="">-- Choose a layout --</option>
            {layouts.map((layout) => (
              <option key={layout.layoutId} value={layout.layoutId}>
                {layout.layoutName || layout.layoutId}
              </option>
            ))}
          </select>
        </div>

        <div className="test-section">
          <h3>Test Data</h3>
          {selectedLayoutData && selectedLayoutData.fields.length > 0 ? (
            selectedLayoutData.fields.map((field: any) => (
              <div key={field.name} className="form-group" style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <label>
                    {field.name}
                    {field.name === "Name" && (
                      <span style={{ color: "#dc2626" }}>*</span>
                    )}
                  </label>
                  <input
                    type="text"
                    placeholder={`Enter ${field.name.toLowerCase()}`}
                    value={testData[field.name] || ""}
                    onChange={(e) =>
                      handleTestDataChange(field.name, e.target.value)
                    }
                    disabled={loading}
                    className="test-input"
                  />
                </div>
                <button
                  onClick={() => {
                    const newTestData = { ...testData };
                    delete newTestData[field.name];
                    setTestData(newTestData);
                  }}
                  disabled={loading}
                  style={{
                    backgroundColor: "#dc2626",
                    color: "white",
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#b91c1c")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
                  title="Clear this field"
                >
                  ✕
                </button>
              </div>
            ))
          ) : (
            <p>No fields configured for this layout</p>
          )}
        </div>

        <div className="test-actions">
          <button
            onClick={handleGenerateCertificate}
            disabled={loading || !selectedLayout}
            className="btn-generate"
          >
            {loading ? "Generating..." : "Generate & Download Certificate"}
          </button>
        </div>

        <div className="test-info">
          <h4>How to Test</h4>
          <ul>
            <li>Select a confirmed layout</li>
            <li>Fill in the test data (Name is required)</li>
            <li>Click "Generate & Download Certificate"</li>
            <li>The PDF downloads as Name_Layout_LayoutName_Certificate.pdf (invalid characters removed).</li>
          </ul>
        </div>
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
};
