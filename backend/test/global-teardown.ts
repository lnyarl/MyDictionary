// biome-ignore assist/source/organizeImports: <explanation>
import "reflect-metadata";
import { resolve } from "node:path";
import { register } from "tsconfig-paths";
import { cleanupTestDatabase } from "../src/common/database/test-database.helper";
import { destroyTestRedisInstance } from "../src/common/cache/test-cache.module";

register({
  baseUrl: resolve(__dirname, ".."),
  paths: {
    "@shared": ["../shared/src"],
    "@shared/*": ["../shared/src/*"],
  },
});

export default async function globalTeardown(): Promise<void> {
  console.log("🧹 Cleaning up test environment...");
  await cleanupTestDatabase();
  await destroyTestRedisInstance();

  console.log("✅ Cleanup complete!");
  // var wtf = require("wtfnode");
  // wtf.dump();
}
