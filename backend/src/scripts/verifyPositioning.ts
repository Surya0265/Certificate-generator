
import { generateCertificatePDF } from "../utils/pdfGenerator";
import { Layout } from "../types";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Mock data
const mockLayout: Layout = {
    layoutId: "test-layout",
    layoutName: "Infinitum Test",
    templateFile: "infinitum.pdf", // Ensure this exists or use a dummy
    fonts: [
        {
            name: "Infinitum",
            file: "a4ea6b40-a77a-4120-a465-f00168015cab.otf" // Use the known existing OTF
        }
    ],
    fields: [
        {
            name: "Name",
            x: 400, // Center of 800 width
            y: 300,
            fontSize: 50,
            fontFamily: "Infinitum",
            color: "#ffffff",
            alignment: "center"
        }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    confirmed: true
};

const mockData = {
    Name: "Aarav Krishnamoorthy Venkateswaran" // 32 chars
};

async function verify() {
    try {
        console.log("Generating verification PDF...");

        // We need to ensure we can find the template. 
        // If 'infinitum.pdf' is not in uploads/templates, this might fail.
        // Let's check if we can use the one from the debug script or just assume it's there.
        // The debug script used 'doc.addPage' manually.
        // Real generation needs a template file.

        // Quick fix: Check if template exists, if not, create a dummy one?
        // Complex. Let's just try to run it. If it fails on template, at least we know the code ran.

        // Actually, let's use the 'checkLayout' logic to get a REAL layout first.
        // That's safer.

        const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/certificate-generator";
        await mongoose.connect(MONGO_URI);

        // Get latest layout
        const LayoutModel = require("../models/Layout").Layout;
        const layoutIdx = await LayoutModel.findOne({}).sort({ updatedAt: -1 });

        if (!layoutIdx) {
            console.error("No layout found to test with.");
            return;
        }

        const layout = layoutIdx.toObject();

        console.log(`Testing with layout: ${layout.layoutName}`);

        // Force the test data
        const pdfBuffer = await generateCertificatePDF(layout, mockData);

        const outputPath = path.join(process.cwd(), "verify_positioning.pdf");
        fs.writeFileSync(outputPath, pdfBuffer);
        console.log(`Saved verification PDF to: ${outputPath}`);

        await mongoose.disconnect();

    } catch (error) {
        console.error("Verification failed:", error);
    }
}

verify();
