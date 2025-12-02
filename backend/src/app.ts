import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import { ensureDirectories } from "./utils/fileHandler";
import { errorHandler } from "./middleware/errorHandler";
import { authMiddleware } from "./middleware/auth";

// Routes
import authRoutes from "./routes/authRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import layoutRoutes from "./routes/layoutRoutes";
import certificateRoutes from "./routes/certificateRoutes";

const app = express();

// Ensure data directories exist
ensureDirectories();

// Middleware
const allowedOrigins = [
  process.env.CORS_ORIGIN_1 || "http://localhost:3000",
  process.env.CORS_ORIGIN_2 || "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    exposedHeaders: ["Content-Disposition", "X-Certificate-Filename"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(authMiddleware);

// Serve uploaded files (templates, fonts)
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "data", "uploads"))
);

// Routes
app.use("/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/layouts", layoutRoutes);
app.use("/api/certificates", certificateRoutes);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    error: `${req.method} ${req.path} not found`,
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
