import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const popupsTable = pgTable("popups", {
  id: serial("id").primaryKey(),
  titleAr: text("title_ar"),
  titleEn: text("title_en"),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  ctaTextAr: text("cta_text_ar"),
  ctaTextEn: text("cta_text_en"),
  image: text("image"),
  videoThumbnail: text("video_thumbnail"),
  targetUrl: text("target_url"),
  active: boolean("active").notNull().default(false),
  showOnce: boolean("show_once").notNull().default(true),
  maxImpressions: integer("max_impressions"),
  impressionCount: integer("impression_count").notNull().default(0),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPopupSchema = createInsertSchema(popupsTable).omit({ id: true, createdAt: true, impressionCount: true });
export type InsertPopup = z.infer<typeof insertPopupSchema>;
export type Popup = typeof popupsTable.$inferSelect;
