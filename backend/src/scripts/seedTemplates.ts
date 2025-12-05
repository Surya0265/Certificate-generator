import mongoose from "mongoose";
import dotenv from "dotenv";
import { PredefinedTemplate } from "../models/PredefinedTemplate";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/certificate-generator";

const seedTemplates = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing templates
    await PredefinedTemplate.deleteMany({});
    console.log("Cleared existing templates");

    // Create templates based on actual files
    const templates = [
      {
        templateId: "template-kriya-event",
        templateName: "Kriya Event Certificate",
        description: "Certificate for Kriya Event participants",
        fileName: "kriya-event.pdf",
        category: "kriya",
      },
      {
        templateId: "template-kriya-workshop",
        templateName: "Kriya Workshop Certificate",
        description: "Certificate for Kriya Workshop attendees",
        fileName: "kriya-workshop.pdf",
        category: "kriya",
      },
      {
        templateId: "template-kriya-paper",
        templateName: "Kriya Paper Presentation Certificate",
        description: "Certificate for paper presentations at Kriya",
        fileName: "kriya-paperpresentation.pdf",
        category: "kriya",
      },
      {
        templateId: "template-infinitum",
        templateName: "Infinitum Certificate",
        description: "Certificate for Infinitum event participants",
        fileName: "infinitum.pdf",
        category: "infinitum",
      },
    ];

    const inserted = await PredefinedTemplate.insertMany(templates);
    console.log(`Successfully added ${inserted.length} templates`);

    inserted.forEach((template) => {
      console.log(`- ${template.templateName} (${template.templateId})`);
    });

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding templates:", error);
    process.exit(1);
  }
};

seedTemplates();
