import "dotenv/config";
import app from "./app";
import { testConnection } from "./db";
import { runMigrations } from "./db/migrate";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await testConnection();
    console.log("Database connection successful");
    
    // Run migrations automatically on startup
    await runMigrations();
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
  app.listen(Number(PORT), () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
