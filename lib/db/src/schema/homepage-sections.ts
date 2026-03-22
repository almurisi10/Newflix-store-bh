import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const homepageSectionsTable = pgTable("homepage_sections", {
  id: serial("id").primaryKey(),
  sectionType: text("section_type").notNull(),
  titleAr: text("title_ar"),
  titleEn: text("title_en"),
  subtitleAr: text("subtitle_ar"),
  subtitleEn: text("subtitle_en"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  config: jsonb("config").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertHomepageSectionSchema = createInsertSchema(homepageSectionsTable).omit({ id: true, createdAt: true });
export type InsertHomepageSection = z.infer<typeof insertHomepageSectionSchema>;
export type HomepageSection = typeof homepageSectionsTable.$inferSelect;
