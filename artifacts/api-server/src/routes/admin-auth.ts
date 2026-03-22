import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, adminUsersTable, adminSettingsTable, adminActivityLogsTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";

const JWT_SECRET = process.env.JWT_SECRET || "newflix-admin-secret-key-2024";
const INVITE_CODE = process.env.ADMIN_INVITE_CODE || "";

if (!admin.apps.length) {
  admin.initializeApp({ projectId: "dukani-emq1m" });
}

const router: IRouter = Router();

router.post("/admin-auth/register", async (req, res): Promise<void> => {
  const { email, password, displayName, inviteCode } = req.body;

  if (!email || !password || !displayName || !inviteCode) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  if (!INVITE_CODE || inviteCode !== INVITE_CODE) {
    res.status(403).json({ error: "Invalid invite code" });
    return;
  }

  const signupDisabledSetting = await db.select().from(adminSettingsTable).where(eq(adminSettingsTable.settingKey, "admin_signup_disabled"));
  if (signupDisabledSetting.length > 0 && (signupDisabledSetting[0]?.settingValue as any)?.value === true) {
    res.status(403).json({ error: "Admin registration is currently disabled" });
    return;
  }

  const existing = await db.select().from(adminUsersTable).where(eq(adminUsersTable.email, email));
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [newAdmin] = await db.insert(adminUsersTable).values({
    email,
    passwordHash,
    displayName,
    role: "admin",
    active: true,
  }).returning();

  await db.insert(adminActivityLogsTable).values({
    adminEmail: email,
    action: "register",
    entityType: "admin_user",
    entityId: String(newAdmin!.id),
    details: { displayName },
    ipAddress: req.ip || req.headers['x-forwarded-for'] as string || null,
  });

  const token = jwt.sign(
    { id: newAdmin!.id, email: newAdmin!.email, role: newAdmin!.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(201).json({
    token,
    admin: {
      id: newAdmin!.id,
      email: newAdmin!.email,
      displayName: newAdmin!.displayName,
      role: newAdmin!.role,
    },
  });
});

router.post("/admin-auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const [admin] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.email, email));
  if (!admin) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (!admin.active) {
    res.status(403).json({ error: "Account is deactivated" });
    return;
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  await db.update(adminUsersTable).set({ lastLoginAt: new Date() }).where(eq(adminUsersTable.id, admin.id));

  await db.insert(adminActivityLogsTable).values({
    adminEmail: email,
    action: "login",
    entityType: "admin_user",
    entityId: String(admin.id),
    details: {},
    ipAddress: req.ip || req.headers['x-forwarded-for'] as string || null,
  });

  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      displayName: admin.displayName,
      role: admin.role,
    },
  });
});

router.post("/admin-auth/firebase-login", async (req, res): Promise<void> => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400).json({ error: "Firebase ID token is required" });
    return;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const email = decodedToken.email;

    if (!email) {
      res.status(400).json({ error: "No email associated with this account" });
      return;
    }

    const [existingAdmin] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.email, email));

    if (!existingAdmin) {
      res.status(403).json({ error: "No admin account found for this email. Register first with an invite code." });
      return;
    }

    if (!existingAdmin.active) {
      res.status(403).json({ error: "Account is deactivated" });
      return;
    }

    await db.update(adminUsersTable).set({ lastLoginAt: new Date() }).where(eq(adminUsersTable.id, existingAdmin.id));

    await db.insert(adminActivityLogsTable).values({
      adminEmail: email,
      action: "firebase_login",
      entityType: "admin_user",
      entityId: String(existingAdmin.id),
      details: { provider: "firebase" },
      ipAddress: req.ip || req.headers['x-forwarded-for'] as string || null,
    });

    const token = jwt.sign(
      { id: existingAdmin.id, email: existingAdmin.email, role: existingAdmin.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      admin: {
        id: existingAdmin.id,
        email: existingAdmin.email,
        displayName: existingAdmin.displayName,
        role: existingAdmin.role,
      },
    });
  } catch (err: any) {
    console.error("Firebase login error:", err);
    res.status(401).json({ error: "Invalid Firebase token" });
  }
});

router.post("/admin-auth/reset-password", async (req, res): Promise<void> => {
  const { email, inviteCode, newPassword } = req.body;

  if (!email || !inviteCode || !newPassword) {
    res.status(400).json({ error: "Email, invite code, and new password are required" });
    return;
  }

  if (!INVITE_CODE || inviteCode !== INVITE_CODE) {
    res.status(403).json({ error: "Invalid invite code" });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const [existingAdmin] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.email, email));
  if (!existingAdmin) {
    res.status(404).json({ error: "No admin account found with this email" });
    return;
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db.update(adminUsersTable)
    .set({ passwordHash })
    .where(eq(adminUsersTable.email, email));

  await db.insert(adminActivityLogsTable).values({
    adminEmail: email,
    action: "password_reset",
    entityType: "admin_user",
    entityId: String(existingAdmin.id),
    details: {},
    ipAddress: req.ip || req.headers['x-forwarded-for'] as string || null,
  });

  res.json({ message: "Password updated successfully" });
});

router.get("/admin-auth/me", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1]!, JWT_SECRET) as any;
    const [admin] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.id, decoded.id));
    if (!admin || !admin.active) {
      res.status(401).json({ error: "Invalid or deactivated admin" });
      return;
    }

    res.json({
      admin: {
        id: admin.id,
        email: admin.email,
        displayName: admin.displayName,
        role: admin.role,
      },
    });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
