import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  integer,
  real,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phone: varchar('phone', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    salt: varchar('salt', { length: 255 }).notNull(),
    role: varchar('role', { length: 255 }).notNull(), // admin, agent, prospect
    isVerified: boolean('is_verified').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('email_unique').on(table.email),
    uniqueIndex('phone_unique').on(table.phone),
  ],
);


/* Storage using Cloudflare R2 */
export const r2_files = pgTable('r2_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  object_key: text('object_key').notNull().unique(),
  file_url: text('file_url').notNull(),
  user_id: text('user_id').notNull(),
  upload_timestamp: timestamp('upload_timestamp').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Schemas
export const userSchema = createSelectSchema(users);
export const createUserSchema = createInsertSchema(users);


export const r2FileInsertSchema = createInsertSchema(r2_files);
export const r2FileUpdateSchema = createUpdateSchema(r2_files);
export const r2FileSelectSchema = createSelectSchema(r2_files);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type R2File = typeof r2_files.$inferSelect;
export type NewR2File = typeof r2_files.$inferInsert;
