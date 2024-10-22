import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    dialect: "sqlite",
    schema: "./src/schema.ts",
    out: "./drizzle",
    dbCredentials: {
        url: 'file:./sqlite.db'
    }
});
