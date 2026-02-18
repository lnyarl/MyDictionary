import { execSync } from "node:child_process";
import path from "node:path";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import dotenv from "dotenv";
import { controllerSeedData } from "./controller-seed-data";

import { AppModule as BackendAppModule } from "../backend/src/app.module";
import { AuthController as BackendAuthController } from "../backend/src/auth/auth.controller";
import { DefinitionsController } from "../backend/src/definitions/definitions.controller";
import { FeedController } from "../backend/src/feed/feed.controller";
import { FollowsController } from "../backend/src/follows/follows.controller";
import { LikesController } from "../backend/src/likes/likes.controller";
import { ReportsController as BackendReportsController } from "../backend/src/reports/reports.controller";
import { AdminUsersModule } from "../backend-admin/src/admin-users/admin-users.module";
import { AdminUsersController } from "../backend-admin/src/admin-users/admin-users.controller";
import { AuthModule as BackendAdminAuthModule } from "../backend-admin/src/auth/auth.module";
import { BadgesController as AdminBadgesController } from "../backend-admin/src/badges/badges.controller";
import { BadgesModule } from "../backend-admin/src/badges/badges.module";
import { DatabaseModule as BackendAdminDatabaseModule } from "../backend-admin/src/common/database/database.module";
import { ReportsController as AdminReportsController } from "../backend-admin/src/reports/reports.controller";
import { ReportsModule as BackendAdminReportsModule } from "../backend-admin/src/reports/reports.module";
import { UsersController as AdminUsersApiController } from "../backend-admin/src/users/users.controller";
import { UsersModule as BackendAdminUsersModule } from "../backend-admin/src/users/users.module";
import { WordsController as AdminWordsController } from "../backend-admin/src/words/words.controller";
import { WordsModule as BackendAdminWordsModule } from "../backend-admin/src/words/words.module";

@Module({
  imports: [
    BackendAdminDatabaseModule,
    AdminUsersModule,
    BackendAdminAuthModule,
    BackendAdminUsersModule,
    BackendAdminWordsModule,
    BackendAdminReportsModule,
    BadgesModule,
  ],
})
class SeedBackendAdminModule {}

interface SeedTask {
  name: string;
  run: () => Promise<void>;
}

interface SeedReport {
  planned: number;
  succeeded: number;
  failed: number;
  failures: string[];
}

interface SeedUser {
  id: string;
  email: string;
  nickname: string;
}

interface FeedResult {
  id: string;
  wordId: string;
}

interface ReportResponsePayload {
  refreshToken?: string;
}

function loadEnvFiles() {
  dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });
  dotenv.config({
    path: path.resolve(process.cwd(), "backend-admin/.env"),
    override: false,
  });
}

function runDbReset() {
  console.log("[seed] Running database reset...");
  execSync("yarn db:reset", { stdio: "inherit" });
}

function createResponseMock(bucket: ReportResponsePayload) {
  return {
    status: (_code: number) => {
      return {
        json: (payload: ReportResponsePayload) => {
          if (payload.refreshToken) {
            bucket.refreshToken = payload.refreshToken;
          }
          return payload;
        },
      };
    },
  };
}

async function main() {
  loadEnvFiles();
  runDbReset();

  const report: SeedReport = {
    planned: 0,
    succeeded: 0,
    failed: 0,
    failures: [],
  };

  const backendApp = await NestFactory.createApplicationContext(
    BackendAppModule,
    {
      logger: ["error", "warn"],
    },
  );
  const backendAdminApp = await NestFactory.createApplicationContext(
    SeedBackendAdminModule,
    {
      logger: ["error", "warn"],
    },
  );

  const createdUsers: SeedUser[] = [];
  const createdFeeds: FeedResult[] = [];
  let createdBadgeId = "";
  let createdReportId = "";

  const backendAuthController = backendApp.get(BackendAuthController);
  const definitionsController = backendApp.get(DefinitionsController);
  const feedController = backendApp.get(FeedController);
  const followsController = backendApp.get(FollowsController);
  const likesController = backendApp.get(LikesController);
  const backendReportsController = backendApp.get(BackendReportsController);

  const adminUsersController = backendAdminApp.get(AdminUsersController);
  const adminBadgesController = backendAdminApp.get(AdminBadgesController);
  const adminReportsController = backendAdminApp.get(AdminReportsController);
  const adminUsersApiController = backendAdminApp.get(AdminUsersApiController);
  const adminWordsController = backendAdminApp.get(AdminWordsController);

  const tasks: SeedTask[] = [
    {
      name: "admin-users.create bootstrap admin",
      run: async () => {
        await adminUsersController.create(
          controllerSeedData.admin.bootstrapAdmin,
        );
      },
    },
    ...controllerSeedData.admin.users.map((user) => ({
      name: `admin.users.createUser ${user.email}`,
      run: async () => {
        const created = (await adminUsersApiController.createUser(
          user,
        )) as SeedUser;
        createdUsers.push(created);
      },
    })),
    {
      name: "admin.badges.create",
      run: async () => {
        const badge = await adminBadgesController.create(
          controllerSeedData.admin.badge,
        );
        createdBadgeId = badge.id;
      },
    },
    {
      name: "admin.words.createDummyWord",
      run: async () => {
        await adminWordsController.createDummyWord(createdUsers[0].id);
      },
    },
    {
      name: "backend.feed.createFeed user1",
      run: async () => {
        const feed = (await feedController.createFeed(
          createdUsers[0],
          controllerSeedData.backend.feeds[0],
        )) as FeedResult;
        createdFeeds.push(feed);
      },
    },
    {
      name: "backend.feed.createFeed user2",
      run: async () => {
        const feed = (await feedController.createFeed(
          createdUsers[1],
          controllerSeedData.backend.feeds[1],
        )) as FeedResult;
        createdFeeds.push(feed);
      },
    },
    {
      name: "backend.definitions.update",
      run: async () => {
        await definitionsController.update(
          createdFeeds[0].id,
          createdUsers[0],
          controllerSeedData.backend.definitionUpdate,
        );
      },
    },
    {
      name: "backend.follows.follow",
      run: async () => {
        await followsController.follow(createdUsers[0], createdUsers[1].id);
      },
    },
    {
      name: "backend.likes.toggle",
      run: async () => {
        await likesController.toggle(createdFeeds[1].id, createdUsers[0]);
      },
    },
    {
      name: "backend.reports.create",
      run: async () => {
        const reportEntity = await backendReportsController.create(
          createdUsers[0],
          {
            definitionId: createdFeeds[1].id,
            reportedUserId: createdUsers[1].id,
            reason: controllerSeedData.backend.report.reason,
            description: controllerSeedData.backend.report.description,
          },
        );
        createdReportId = reportEntity.id;
      },
    },
    {
      name: "admin.reports.updateStatus",
      run: async () => {
        await adminReportsController.updateStatus(createdReportId, "RESOLVED");
      },
    },
    {
      name: "admin.badges.grantBadge",
      run: async () => {
        await adminBadgesController.grantBadge(
          createdUsers[0].id,
          createdBadgeId,
        );
      },
    },
    {
      name: "admin.users.impersonate",
      run: async () => {
        await adminUsersApiController.impersonateUser(createdUsers[0].id);
      },
    },
    {
      name: "backend.auth.createSession",
      run: async () => {
        const impersonation = await adminUsersApiController.impersonateUser(
          createdUsers[0].id,
        );
        const responseBucket: ReportResponsePayload = {};
        await backendAuthController.createSession(
          { token: impersonation.token },
          createResponseMock(responseBucket) as never,
        );

        if (!responseBucket.refreshToken) {
          throw new Error("refreshToken not generated from createSession");
        }
      },
    },
    {
      name: "backend.auth.refreshToken",
      run: async () => {
        const impersonation = await adminUsersApiController.impersonateUser(
          createdUsers[0].id,
        );
        const sessionBucket: ReportResponsePayload = {};
        await backendAuthController.createSession(
          { token: impersonation.token },
          createResponseMock(sessionBucket) as never,
        );

        if (!sessionBucket.refreshToken) {
          throw new Error("refreshToken not available for refresh flow");
        }

        const refreshBucket: ReportResponsePayload = {};
        await backendAuthController.refreshToken(
          { headers: {} } as never,
          { refreshToken: sessionBucket.refreshToken },
          createResponseMock(refreshBucket) as never,
        );
      },
    },
  ];

  report.planned = tasks.length;

  for (const task of tasks) {
    try {
      await task.run();
      report.succeeded += 1;
      console.log(`[seed][ok] ${task.name}`);
    } catch (error) {
      report.failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      report.failures.push(`${task.name}: ${message}`);
      console.error(`[seed][fail] ${task.name} -> ${message}`);
    }
  }

  await backendApp.close();
  await backendAdminApp.close();

  console.log("\n========== Controller Seed Report ==========");
  console.log(`planned: ${report.planned}`);
  console.log(`succeeded: ${report.succeeded}`);
  console.log(`failed: ${report.failed}`);

  if (report.failures.length > 0) {
    console.log("failures:");
    for (const failure of report.failures) {
      console.log(`- ${failure}`);
    }
  }

  if (report.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("[seed] fatal error", error);
  process.exit(1);
});
