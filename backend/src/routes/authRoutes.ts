import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";

const router = Router();

interface LoginRequest extends Request {
  body: {
    username?: string;
    password?: string;
  };
}

interface User {
  username: string;
  password: string;
}

// Load users from JSON file
function loadUsers(): User[] {
  try {
    const usersPath = path.join(process.cwd(), "data", "users.json");
    const data = fs.readFileSync(usersPath, "utf-8");
    const json = JSON.parse(data);
    return json.users || [];
  } catch (error) {
    console.error("Error loading users:", error);
    return [];
  }
}

/**
 * POST /auth/login
 * Login endpoint with credentials from users.json
 */
router.post("/login", (req: LoginRequest, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password required",
    });
  }

  // Validate against users from JSON
  const users = loadUsers();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");

    res.json({
      success: true,
      token,
      user: { username },
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password",
    });
  }
});

export default router;
