import mongoose, { Schema, Document } from "mongoose";

export interface ILayout extends Document {
  layoutId: string;
  layoutName?: string;
  templateFile: string;
  fonts: Array<{
    name: string;
    file: string;
  }>;
  fields: Array<{
    name: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    color: string;
    bold?: boolean;
    italic?: boolean;
    alignment?: "left" | "center" | "right";
  }>;
  createdAt: Date;
  updatedAt: Date;
  confirmed: boolean;
  createdBy?: string;
}

const layoutSchema = new Schema<ILayout>(
  {
    layoutId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    layoutName: {
      type: String,
      default: null,
    },
    templateFile: {
      type: String,
      required: true,
    },
    fonts: [
      {
        name: String,
        file: String,
      },
    ],
    fields: [
      {
        name: String,
        x: Number,
        y: Number,
        fontSize: Number,
        fontFamily: String,
        color: String,
        bold: Boolean,
        italic: Boolean,
        alignment: {
          type: String,
          enum: ["left", "center", "right"],
        },
      },
    ],
    confirmed: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Layout = mongoose.model<ILayout>("Layout", layoutSchema);
