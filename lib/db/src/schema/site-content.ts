import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const siteContentTable = pgTable("site_content", {
  id: serial("id").primaryKey(),
  contentKey: text("content_key").notNull().unique(),
  page: text("page").notNull(),
  section: text("section").notNull().default("general"),
  valueAr: text("value_ar").notNull().default(""),
  valueEn: text("value_en").notNull().default(""),
  contentType: text("content_type").notNull().default("text"),
  styles: jsonb("styles").notNull().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: text("updated_by"),
});

export const insertSiteContentSchema = createInsertSchema(siteContentTable).omit({ id: true, updatedAt: true });
export type InsertSiteContent = z.infer<typeof insertSiteContentSchema>;
export type SiteContent = typeof siteContentTable.$inferSelect;
