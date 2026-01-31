import { Test, TestingModuleBuilder } from "@nestjs/testing";
import { AppModule } from "../../app.module";
import { CacheModule } from "../../common/cache/cache.module";
import { DatabaseModule } from "../../common/database/database.module";
import { TestCacheModule } from "./test-cache.module";
import { TestDatabaseModule } from "./test-database.module";

export const getTestModuleBuilder = async () => {
  const moduleFixture: TestingModuleBuilder = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideModule(DatabaseModule)
    .useModule(TestDatabaseModule)
    .overrideModule(CacheModule)
    .useModule(TestCacheModule);

  return moduleFixture;
};
