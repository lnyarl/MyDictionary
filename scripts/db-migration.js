const { execSync } = require("child_process");
require("dotenv").config({
  path: "./backend/.env",
});

const DB_CONTAINER = "stashy-db-dev";
const DB_NAME = process.env.DB_DATABASE;

function run() {
  console.log("=== Stashy Database Reset ===");
  console.log(`Resetting database '${DB_NAME}' in container '${DB_CONTAINER}'...`);

  try {
    console.log("Step 1: Running migrations via migrate.js...");
    execSync(
      `docker exec --env-file ./backend/.env -i ${DB_CONTAINER} node /app/backend/scripts/migrate.js`,
      {
        stdio: "inherit",
      },
    );

    console.log("\n=== Database migration complete ===");
  } catch (error) {
    console.error("\nError during database reset:");
    console.error(error.message);
    process.exit(1);
  }
}

run();
