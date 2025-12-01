export interface Font {
  name: string;
  file: string; // relative path to font file
}

export interface TextField {
  name: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold?: boolean;
  italic?: boolean;
  alignment?: "left" | "center" | "right";
}

export interface Layout {
  layoutId: string;
  layoutName?: string; // Event name or layout name
  templateFile: string; // relative path to template
  fonts: Font[];
  fields: TextField[];
  createdAt: string;
  updatedAt: string;
  confirmed: boolean;
}

export interface CertificateRequest {
  layoutId: string;
  data: Record<string, string>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
