import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from "./src/schema";

const sqlite = new Database(import.meta.env.DATABASE_URL);
sqlite.exec("PRAGMA foreign_keys = ON;");
export const db = drizzle(sqlite, { schema: schema });
