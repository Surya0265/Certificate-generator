
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

async function debugPdf() {
    try {
        console.log("Starting debug PDF generation...");

        // 1. Create a simple document
        const doc = await PDFDocument.create();
        doc.registerFontkit(fontkit);

        // 2. Find the uploaded font
        const fontsDir = path.join(process.cwd(), "data", "uploads", "fonts");
        if (!fs.existsSync(fontsDir)) {
            console.error("Fonts directory not found!");
            return;
        }

        const files = fs.readdirSync(fontsDir);
        const otfFile = files.find(f => f.endsWith(".otf"));

        if (!otfFile) {
            console.error("No OTF file found in uploads!");
            return;
        }

        const fontPath = path.join(fontsDir, otfFile);
        console.log(`Found OTF file: ${fontPath}`);

        // 3. Try to embed it
        const fontBytes = fs.readFileSync(fontPath);
        console.log(`Read ${fontBytes.length} bytes.`);

        try {
            const customFont = await doc.embedFont(fontBytes, { subset: true });
            console.log("Font embedded successfully!");

            // 4. Add a page and draw text
            const page = doc.addPage([1200, 800]); // Landscape

            // Simulate Infinitum style (White text on black background)
            page.drawRectangle({
                x: 0,
                y: 0,
                width: 1200,
                height: 800,
                color: rgb(0, 0, 0),
            });

            // Validating "Neue Machina" style
            page.drawText("CERTIFICATE", {
                x: 100,
                y: 600,
                size: 50,
                font: customFont,
                color: rgb(1, 1, 1), // White
            });

            page.drawText("OF PARTICIPATION", {
                x: 100,
                y: 530,
                size: 50,
                font: customFont,
                color: rgb(1, 1, 1),
            });

            page.drawText("This certificate is presented to:", {
                x: 100,
                y: 450,
                size: 30,
                font: customFont,
                color: rgb(1, 1, 1),
            });

            page.drawText("Suryaprakash B", {
                x: 100,
                y: 350,
                size: 60,
                font: customFont,
                color: rgb(1, 1, 1),
            });

            page.drawText("for participation in Git Wars", {
                x: 100,
                y: 250,
                size: 30,
                font: customFont,
                color: rgb(1, 1, 1),
            });

            // 5. Save
            const pdfBytes = await doc.save();
            const outputPath = path.join(process.cwd(), "infinitum_debug_sample.pdf");
            fs.writeFileSync(outputPath, pdfBytes);
            console.log(`Saved sample PDF to: ${outputPath}`);

        } catch (e) {
            console.error("Failed to embed font:", e);
        }

    } catch (error) {
        console.error("Global error:", error);
    }
}

debugPdf();
