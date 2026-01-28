import fs from "fs/promises";
import path from "path";
import pool from "./index";

export async function runMigrations() {
  const client = await pool.connect();

  try {
    console.log("Checking for database migrations...");

    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS __migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const migrationsDir = path.join(__dirname, "migrations");
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files
      .filter((f) => f.endsWith(".sql"))
      .sort();

    const { rows: appliedRows } = await client.query(
      "SELECT name FROM __migrations"
    );
    const appliedNames = new Set(appliedRows.map((r) => r.name));

    // Run pending migrations
    for (const file of sqlFiles) {
      if (!appliedNames.has(file)) {
        console.log(`Applying migration: ${file}`);
        const filePath = path.join(migrationsDir, file);
        const sql = await fs.readFile(filePath, "utf-8");

        try {
          await client.query("BEGIN");
          await client.query(sql);
          await client.query(
            "INSERT INTO __migrations (name) VALUES ($1)",
            [file]
          );
          await client.query("COMMIT");
          console.log(`✓ Applied ${file}`);
        } catch (err) {
          await client.query("ROLLBACK");
          console.error(`Error applying ${file}:`, err);
          throw err;
        }
      }
    }
    console.log("All migrations applied successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    client.release();
  }
}
