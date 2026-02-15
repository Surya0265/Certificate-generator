
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Layout } from "../models/Layout";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/certificate-generator";

async function checkLayout() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        // Find the most recent layout
        const layout = await Layout.findOne({}).sort({ updatedAt: -1 });

        if (!layout) {
            console.log("No layouts found.");
        } else {
            console.log("Latest Layout:");
            console.log("ID:", layout.layoutId);
            console.log("Name:", layout.layoutName);
            console.log("Template:", layout.templateFile);
            console.log("Confirmed:", layout.confirmed);
            console.log("Fonts:", JSON.stringify(layout.fonts, null, 2));
            console.log("First Field Font:", layout.fields.length > 0 ? layout.fields[0].fontFamily : "No fields");
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

checkLayout();
