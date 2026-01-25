import { Global, Module } from "@nestjs/common";
import { IStorageService, STORAGE_SERVICE } from "../../common/services/storage/storage.interface";

let testStorageInstance: IStorageService | null = null;
export function createStorageService(): IStorageService {
  if (!testStorageInstance) {
    testStorageInstance = {
      uploadFile(file: Express.Multer.File, folder?: string): Promise<string> {
        return Promise.resolve("test-file-path");
      },
    };
  }
  return testStorageInstance;
}

export const testStorageProvider = {
  provide: STORAGE_SERVICE,
  useFactory: (): IStorageService => createStorageService(),
};

@Global()
@Module({
  providers: [testStorageProvider],
  exports: [testStorageProvider],
})
export class TestDatabaseModule {}
