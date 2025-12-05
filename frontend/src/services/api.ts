import axios from "axios";
import { Layout, TextField } from "../types";

export const API_BASE_URL = import.meta.env.VITE_API_URL;
export const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Add authorization header interceptor
axiosInstance.interceptors.request.use((config) => {
  const user = localStorage.getItem("user");
  if (user) {
    const userData = JSON.parse(user);
    if (userData.token) {
      config.headers.Authorization = `Bearer ${userData.token}`;
    }
    if (userData.username) {
      config.headers["X-User"] = userData.username;
    }
  }
  return config;
});

// Upload Services
export const uploadTemplate = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post("/upload/template", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const uploadFont = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post("/upload/font", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Layout Services
export const saveLayout = async (layoutData: {
  layoutId?: string;
  layoutName?: string;
  templateFile: string;
  fonts: { name: string; file: string }[];
  fields: TextField[];
  createdBy?: string;
}): Promise<Layout> => {
  const response = await axiosInstance.post("/layouts", layoutData);
  return response.data.data;
};

export const getLayout = async (layoutId: string): Promise<Layout> => {
  const response = await axiosInstance.get(`/layouts/${layoutId}`);
  return response.data.data;
};

export const getAllLayouts = async (): Promise<Layout[]> => {
  const response = await axiosInstance.get("/layouts");
  return response.data.data;
};

export const updateLayout = async (
  layoutId: string,
  layoutData: {
    templateFile?: string;
    fonts?: { name: string; file: string }[];
    fields?: TextField[];
    createdBy?: string;
  }
): Promise<Layout> => {
  const response = await axiosInstance.put(`/layouts/${layoutId}`, layoutData);
  return response.data.data;
};

export const confirmLayout = async (layoutId: string): Promise<Layout> => {
  const response = await axiosInstance.post(
    `/layouts/${layoutId}/confirm`,
    {}
  );
  return response.data.data;
};

export const deleteLayout = async (layoutId: string): Promise<void> => {
  await axiosInstance.delete(`/layouts/${layoutId}`);
};

// Certificate Services
export const generateCertificate = async (
  layoutId: string,
  data: Record<string, string>
): Promise<Blob> => {
  const response = await axiosInstance.post(
    "/certificates/generate",
    { layoutId, data },
    { responseType: "blob" }
  );
  return response.data;
};

export const generateAndSaveCertificate = async (
  layoutId: string,
  data: Record<string, string>
): Promise<any> => {
  const response = await axiosInstance.post("/certificates/generate-and-save", {
    layoutId,
    data,
    returnPath: false,
  });
  return response.data.data;
};

export const downloadCertificate = async (fileName: string): Promise<Blob> => {
  const response = await axiosInstance.get(
    `/certificates/download/${fileName}`,
    { responseType: "blob" }
  );
  return response.data;
};

// Template Services
export interface PredefinedTemplate {
  templateId: string;
  templateName: string;
  description?: string;
  fileName: string;
  category?: string;
}

export const getPredefinedTemplates = async (): Promise<PredefinedTemplate[]> => {
  const response = await axiosInstance.get("/templates");
  return response.data.data;
};

export const getPredefinedTemplate = async (templateId: string): Promise<PredefinedTemplate> => {
  const response = await axiosInstance.get(`/templates/${templateId}`);
  return response.data.data;
};
