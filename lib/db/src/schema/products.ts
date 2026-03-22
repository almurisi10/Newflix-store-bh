import { pgTable, text, serial, timestamp, integer, boolean, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  titleAr: text("title_ar").notNull(),
  titleEn: text("title_en").notNull(),
  shortDescriptionAr: text("short_description_ar").notNull().default(""),
  shortDescriptionEn: text("short_description_en").notNull().default(""),
  fullDescriptionAr: text("full_description_ar").notNull().default(""),
  fullDescriptionEn: text("full_description_en").notNull().default(""),
  mainImage: text("main_image").notNull(),
  gallery: jsonb("gallery").notNull().default([]),
  videoUrl: text("video_url"),
  categoryIds: jsonb("category_ids").notNull().default([]),
  tags: jsonb("tags").notNull().default([]),
  price: real("price").notNull(),
  comparePrice: real("compare_price"),
  discount: real("discount"),
  badges: jsonb("badges").notNull().default([]),
  notes: text("notes"),
  sku: text("sku").notNull(),
  featured: boolean("featured").notNull().default(false),
  bestseller: boolean("bestseller").notNull().default(false),
  active: boolean("active").notNull().default(true),
  stock: integer("stock").notNull().default(0),
  deliveryType: text("delivery_type").notNull().default("instant"),
  productType: text("product_type").notNull().default("code"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
