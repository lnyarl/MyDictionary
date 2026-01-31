import "reflect-metadata";
import { execSync } from "child_process";
import { resolve } from "path";
import { register } from "tsconfig-paths";

// Set environment variables BEFORE any imports or registrations
process.env.NODE_ENV = "test";
process.env.REDIS_HOST = "localhost";
process.env.REDIS_PORT = "6380";
process.env.REDIS_PASSWORD = "testpassword";
process.env.DB_HOST = "localhost";
process.env.DB_PORT = "5433";
process.env.DB_USERNAME = "postgres";
process.env.DB_PASSWORD = "postgres";
process.env.DB_DATABASE = "stashy_test";

// Register paths BEFORE any other internal imports to avoid hoisting issues
register({
  baseUrl: resolve(__dirname, ".."),
  paths: {
    "@stashy/shared": ["../../shared/src", "../../shared/dist"],
    "@stashy/shared/*": ["../../shared/src/*", "../../shared/dist/*"],
  },
});

export default async function globalSetup(): Promise<void> {
  console.log("\n🚀 Setting up test environment...\n");
  const isCI = process.env.CI === "true";
  const skipDocker = process.env.SKIP_DOCKER === "true";

  if (!isCI && !skipDocker) {
    console.log("Starting test Docker containers...");
    try {
      execSync("docker compose -f docker-compose.test.yml up -d --wait", {
        cwd: resolve(__dirname, "../../.."),
        stdio: "inherit",
        timeout: 60000,
        env: {
          ...process.env,
        },
      });
    } catch {
      console.log("Docker containers might already be running, continuing...");
    }
  }

  await waitForServices();
  await initializeDatabase();

  console.log("\n✅ Test environment ready!\n");
}

async function waitForServices(): Promise<void> {
  const { getTestDatabaseHelper } = await import("./helper/test-database.helper");
  const { createTestRedisInstance } = await import("./helper/test-cache.module");

  const maxRetries = 10;
  const retryInterval = 500;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const testDb = getTestDatabaseHelper();
      await testDb.getKnex().raw("SELECT 1");

      const redis = createTestRedisInstance();
      await redis.ping();

      console.log("✅ PostgreSQL and Redis are ready!");
      return;
    } catch (error) {
      if (i === maxRetries - 1) {
        throw new Error("Failed to connect to test services after maximum retries");
      }
      console.log(`Waiting for services... (${i + 1}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, retryInterval));
    }
  }
}

async function initializeDatabase(): Promise<void> {
  const { getTestDatabaseHelper } = await import("./helper/test-database.helper");

  console.log("Initializing test database schema...");
  const testDb = getTestDatabaseHelper();
  await testDb.setupSchema();
  console.log("✅ Database schema initialized!");
}
