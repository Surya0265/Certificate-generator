import mongoose, { Schema, Document } from "mongoose";

export interface IPredefinedTemplate extends Document {
  templateId: string;
  templateName: string;
  description?: string;
  fileName: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const predefinedTemplateSchema = new Schema<IPredefinedTemplate>(
  {
    templateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    templateName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    fileName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "general",
    },
  },
  { timestamps: true }
);

export const PredefinedTemplate = mongoose.model<IPredefinedTemplate>(
  "PredefinedTemplate",
  predefinedTemplateSchema
);
