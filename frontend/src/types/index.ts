export interface Font {
  name: string;
  file: string;
}

export interface TextField {
  id?: string;
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
  layoutName?: string;
  templateFile: string;
  fonts: Font[];
  fields: TextField[];
  createdAt: string;
  updatedAt: string;
  confirmed: boolean;
  createdBy?: string;
}

export interface CanvasTextField extends TextField {
  id: string;
  preview: string;
}
