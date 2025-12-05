import { Router, Request, Response } from "express";
import { User } from "../models/User";
import { asyncHandler, sendSuccess, sendError } from "../middleware/errorHandler";

const router = Router();

interface LoginRequest extends Request {
  body: {
    username?: string;
    password?: string;
  };
}

/**
 * POST /auth/login
 * Login endpoint with credentials from MongoDB
 */
router.post(
  "/login",
  asyncHandler(async (req: LoginRequest, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendError(res, "Username and password required", 400);
    }

    // Find user in MongoDB
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return sendError(res, "Invalid username or password", 401);
    }

    const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");

    sendSuccess(res, { token, user: { username } }, "Login successful");
  })
);

export default router;
