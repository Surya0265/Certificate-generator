import axios from "axios";
import { Layout, TextField } from "../types";

// Use import.meta.env for Vite or window.__REACT_APP__ for CRA
const API_BASE_URL = 
  typeof window !== 'undefined' && (window as any).__REACT_APP_API_URL 
    ? (window as any).__REACT_APP_API_URL
    : "http://localhost:3001/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
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
  templateFile: string;
  fonts: { name: string; file: string }[];
  fields: TextField[];
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
