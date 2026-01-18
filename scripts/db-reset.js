const { execSync } = require("child_process");

const DB_CONTAINER = "stashy-db-dev";
const DB_USER = "postgres";
const DB_NAME = "stashy";

function run() {
  console.log("=== Stashy Database Reset ===");
  console.log(`Resetting database '${DB_NAME}' in container '${DB_CONTAINER}'...`);

  try {
    const sql = `
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
`.trim();

    execSync(`docker exec -i ${DB_CONTAINER} psql -U ${DB_USER} -d ${DB_NAME}`, {
      input: sql,
      stdio: ["pipe", "inherit", "inherit"],
    });

    console.log("Database schema wiped.\n");

    console.log("Step 2: Running migrations via migrate.js...");
    execSync(`docker exec -i ${DB_CONTAINER} node /app/backend/scripts/migrate.js`, {
      stdio: "inherit",
    });

    console.log("Database schema wiped.\n");

    // Step 2: Run migrations
    console.log("Step 2: Running migrations via migrate.js...");
    execSync(`docker exec -i ${DB_CONTAINER} node /app/backend/scripts/migrate.js`, {
      stdio: "inherit",
    });

    console.log("\n=== Database reset and migration complete ===");
  } catch (error) {
    console.error("\nError during database reset:");
    console.error(error.message);
    process.exit(1);
  }
}

run();
