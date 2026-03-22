import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db, adminUsersTable } from "@workspace/db";

const JWT_SECRET = process.env.JWT_SECRET || "newflix-admin-secret-key-2024";

export interface AdminRequest extends Request {
  adminUser?: {
    id: number;
    email: string;
    role: string;
  };
}

export async function requireAdmin(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Admin authentication required" });
    return;
  }

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1]!, JWT_SECRET) as any;

    const [adminUser] = await db.select({ id: adminUsersTable.id, email: adminUsersTable.email, role: adminUsersTable.role, active: adminUsersTable.active }).from(adminUsersTable).where(eq(adminUsersTable.id, decoded.id));

    if (!adminUser || !adminUser.active) {
      res.status(401).json({ error: "Admin account not found or deactivated" });
      return;
    }

    req.adminUser = {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid admin token" });
  }
}
