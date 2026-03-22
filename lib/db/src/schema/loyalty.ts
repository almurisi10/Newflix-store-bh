import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const loyaltyPointsTable = pgTable("loyalty_points", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").notNull(),
  points: integer("points").notNull().default(0),
  type: text("type").notNull(),
  description: text("description"),
  orderId: integer("order_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLoyaltyPointsSchema = createInsertSchema(loyaltyPointsTable).omit({ id: true, createdAt: true });
export type InsertLoyaltyPoints = z.infer<typeof insertLoyaltyPointsSchema>;
export type LoyaltyPoints = typeof loyaltyPointsTable.$inferSelect;
