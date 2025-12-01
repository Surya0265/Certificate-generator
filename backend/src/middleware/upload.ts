import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure storage for templates
const templateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const templatesDir = path.join(UPLOAD_DIR, "templates");
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }
    cb(null, templatesDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Configure storage for fonts
const fontStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fontsDir = path.join(UPLOAD_DIR, "fonts");
    if (!fs.existsSync(fontsDir)) {
      fs.mkdirSync(fontsDir, { recursive: true });
    }
    cb(null, fontsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter for templates
const templateFileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    "image/png",
    "image/jpeg",
    "application/pdf",
    "image/jpg",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PNG, JPG, and PDF are allowed for templates."
      )
    );
  }
};

// File filter for fonts
const fontFileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype === "font/ttf" || file.originalname.endsWith(".ttf")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only TTF fonts are allowed."));
  }
};

export const uploadTemplate = multer({
  storage: templateStorage,
  fileFilter: templateFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

export const uploadFont = multer({
  storage: fontStorage,
  fileFilter: fontFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
