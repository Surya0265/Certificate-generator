import { Request, Response, NextFunction } from "express";
import { Buffer } from "buffer";

declare global {
  namespace Express {
    interface Request {
      user?: {
        username: string;
      };
    }
  }
}

/**
 * Extract username from Authorization header
 * Expected format: Authorization: Bearer {username}
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    try {
      const decoded = Buffer.from(token, "base64").toString("utf-8");
      const [username] = decoded.split(":");
      if (username) {
        req.user = { username };
      }
    } catch (error) {
      console.warn("Failed to decode auth token", error);
    }
  }

  next();
};
