import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";

const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║   Certificate Microservice - Running                    ║
╚══════════════════════════════════════════════════════════╝
    
  Environment: ${NODE_ENV}
  Server:      http://localhost:${PORT}
  Health:      http://localhost:${PORT}/health
  
  API Endpoints:
  ✓ POST   /api/upload/template
  ✓ POST   /api/upload/font
  ✓ POST   /api/layouts
  ✓ GET    /api/layouts
  ✓ GET    /api/layouts/:layoutId
  ✓ PUT    /api/layouts/:layoutId
  ✓ POST   /api/layouts/:layoutId/confirm
  ✓ DELETE /api/layouts/:layoutId
  ✓ POST   /api/certificates/generate
  ✓ POST   /api/certificates/generate-and-save
  ✓ GET    /api/certificates/download/:fileName

`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});
