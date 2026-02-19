import { execSync } from "node:child_process";
import path from "node:path";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import dotenv from "dotenv";
import { AppModule as BackendAppModule } from "../backend/src/app.module";
import { AuthController as BackendAuthController } from "../backend/src/auth/auth.controller";
import { DefinitionsController } from "../backend/src/definitions/definitions.controller";
import { FeedController } from "../backend/src/feed/feed.controller";
import { FollowsController } from "../backend/src/follows/follows.controller";
import { LikesController } from "../backend/src/likes/likes.controller";
import { ReportsController as BackendReportsController } from "../backend/src/reports/reports.controller";
import { AdminUsersController } from "../backend-admin/src/admin-users/admin-users.controller";
import { AdminUsersModule } from "../backend-admin/src/admin-users/admin-users.module";
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
import { controllerSeedData } from "./controller-seed-data";

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

interface SeedBadge {
  id: string;
}

interface SeedReportEntity {
  id: string;
}

interface ImpersonateResult {
  token: string;
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

function composeContent(
  opening: string,
  body: string,
  closing: string,
  term: string,
  userNickname: string,
  serial: number,
) {
  return `${opening} ${term}의 실제 사용 맥락을 ${userNickname} 사용자의 관점에서 정리했습니다. ${body} 번호 ${serial} 항목으로 기록되며, 검색과 복습 시 서로 다른 문맥을 빠르게 비교할 수 있도록 작성되었습니다. ${closing}`;
}

function getFeedInput(
  userIndex: number,
  feedIndex: number,
  userNickname: string,
) {
  const termBase =
    controllerSeedData.backend.termPool[
      (userIndex * controllerSeedData.backend.feedPerUser + feedIndex) %
        controllerSeedData.backend.termPool.length
    ];
  const template =
    controllerSeedData.backend.feedTemplates[
      feedIndex % controllerSeedData.backend.feedTemplates.length
    ];

  return {
    term: `${termBase}-${userNickname}-${feedIndex + 1}`,
    definition: {
      content: composeContent(
        template.opening,
        template.body,
        template.closing,
        termBase,
        userNickname,
        feedIndex + 1,
      ),
      tags: [...template.tags, termBase, userNickname],
      isPublic: template.isPublic,
    },
  };
}

function getUpdateInput(userNickname: string, feedIndex: number) {
  const update = controllerSeedData.backend.userUpdate;

  return {
    content: composeContent(
      update.opening,
      update.body,
      update.closing,
      "revision",
      userNickname,
      feedIndex,
    ),
    tags: [...update.tags, userNickname],
    isPublic: update.isPublic,
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
  const feedsByUser = new Map<string, FeedResult[]>();
  const createdBadgeIds: string[] = [];
  const createdReportIds: string[] = [];

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
        feedsByUser.set(created.id, []);
      },
    })),
    ...controllerSeedData.admin.badges.map((badge) => ({
      name: `admin.badges.create ${badge.code}`,
      run: async () => {
        const createdBadge = (await adminBadgesController.create(
          badge,
        )) as SeedBadge;
        createdBadgeIds.push(createdBadge.id);
      },
    })),
    ...controllerSeedData.admin.users.map((_user, userIndex) => ({
      name: `admin.words.createDummyWord user#${userIndex + 1}`,
      run: async () => {
        await adminWordsController.createDummyWord(createdUsers[userIndex].id);
      },
    })),
    ...controllerSeedData.admin.users.flatMap((_user, userIndex) =>
      Array.from(
        { length: controllerSeedData.backend.feedPerUser },
        (_, feedIndex) => ({
          name: `backend.feed.createFeed user#${userIndex + 1} item#${feedIndex + 1}`,
          run: async () => {
            const user = createdUsers[userIndex];
            const feedInput = getFeedInput(userIndex, feedIndex, user.nickname);
            const feed = (await feedController.createFeed(
              user,
              feedInput,
            )) as FeedResult;
            feedsByUser.get(user.id)?.push(feed);
          },
        }),
      ),
    ),
    ...controllerSeedData.admin.users.map((_user, userIndex) => ({
      name: `backend.definitions.update user#${userIndex + 1}`,
      run: async () => {
        const user = createdUsers[userIndex];
        const userFeeds = feedsByUser.get(user.id);
        if (!userFeeds || userFeeds.length === 0) {
          throw new Error("no feed found for definition update");
        }

        await definitionsController.update(
          userFeeds[0].id,
          user,
          getUpdateInput(user.nickname, 1),
        );
      },
    })),
    ...controllerSeedData.admin.users.slice(1).map((_user, userIndex) => ({
      name: `backend.follows.follow user1->user${userIndex + 2}`,
      run: async () => {
        await followsController.follow(
          createdUsers[0],
          createdUsers[userIndex + 1].id,
        );
      },
    })),
    ...controllerSeedData.admin.users.slice(1).map((_user, userIndex) => ({
      name: `backend.likes.toggle user1->user${userIndex + 2} feed1`,
      run: async () => {
        const targetUser = createdUsers[userIndex + 1];
        const targetFeeds = feedsByUser.get(targetUser.id);
        if (!targetFeeds || targetFeeds.length === 0) {
          throw new Error("no target feed for like");
        }
        await likesController.toggle(targetFeeds[0].id, createdUsers[0]);
      },
    })),
    ...controllerSeedData.backend.reports.map((reportData, reportIndex) => ({
      name: `backend.reports.create #${reportIndex + 1}`,
      run: async () => {
        const targetUser =
          createdUsers[(reportIndex % (createdUsers.length - 1)) + 1];
        const targetFeeds = feedsByUser.get(targetUser.id);
        if (!targetFeeds || targetFeeds.length === 0) {
          throw new Error("no target feed for report");
        }
        const reportEntity = (await backendReportsController.create(
          createdUsers[0],
          {
            definitionId: targetFeeds[reportIndex % targetFeeds.length].id,
            reportedUserId: targetUser.id,
            reason: reportData.reason,
            description: reportData.description,
          },
        )) as SeedReportEntity;

        createdReportIds.push(reportEntity.id);
      },
    })),
    ...controllerSeedData.backend.reports.map((reportData, reportIndex) => ({
      name: `admin.reports.updateStatus #${reportIndex + 1}`,
      run: async () => {
        await adminReportsController.updateStatus(
          createdReportIds[reportIndex],
          reportData.status,
        );
      },
    })),
    ...createdUsers.map((_user, userIndex) => ({
      name: `admin.badges.grantBadge user#${userIndex + 1}`,
      run: async () => {
        const badgeId = createdBadgeIds[userIndex % createdBadgeIds.length];
        await adminBadgesController.grantBadge(
          createdUsers[userIndex].id,
          badgeId,
        );
      },
    })),
    ...createdUsers.map((_user, userIndex) => ({
      name: `admin.users.impersonate user#${userIndex + 1}`,
      run: async () => {
        await adminUsersApiController.impersonateUser(
          createdUsers[userIndex].id,
        );
      },
    })),
    ...createdUsers.map((_user, userIndex) => ({
      name: `backend.auth.createSession user#${userIndex + 1}`,
      run: async () => {
        const impersonation = (await adminUsersApiController.impersonateUser(
          createdUsers[userIndex].id,
        )) as ImpersonateResult;

        const responseBucket: ReportResponsePayload = {};
        await backendAuthController.createSession(
          { token: impersonation.token },
          createResponseMock(responseBucket) as never,
        );

        if (!responseBucket.refreshToken) {
          throw new Error("refreshToken not generated from createSession");
        }
      },
    })),
    ...createdUsers.map((_user, userIndex) => ({
      name: `backend.auth.refreshToken user#${userIndex + 1}`,
      run: async () => {
        const impersonation = (await adminUsersApiController.impersonateUser(
          createdUsers[userIndex].id,
        )) as ImpersonateResult;

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
    })),
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
