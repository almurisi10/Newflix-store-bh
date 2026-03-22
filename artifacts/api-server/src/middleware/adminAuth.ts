import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "newflix-admin-secret-key-2024";

export interface AdminRequest extends Request {
  adminUser?: {
    id: number;
    email: string;
    role: string;
  };
}

export function requireAdmin(req: AdminRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Admin authentication required" });
    return;
  }

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1]!, JWT_SECRET) as any;
    req.adminUser = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid admin token" });
  }
}
