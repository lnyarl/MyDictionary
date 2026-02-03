import { Global, Module } from "@nestjs/common";
import { IStorageService, STORAGE_SERVICE } from "../../common/services/storage/storage.interface";

let testStorageInstance: IStorageService | null = null;
export function createStorageService(): IStorageService {
  if (!testStorageInstance) {
    const privateStorage = {};
    testStorageInstance = {
      uploadFile(file: Express.Multer.File, folder?: string): Promise<string> {
        privateStorage[folder] = file;
        return Promise.resolve(`test-file-path/${folder}/${file.filename}`);
      },
      uploadTempFile(file: Express.Multer.File, folder?: string): Promise<string> {
        privateStorage[folder] = file;
        return Promise.resolve(`test-file-path/${folder}/${file.filename}`);
      },
      moveFileToPermanent(tempUrl: string, folder?: string): Promise<string> {
        privateStorage[folder] = privateStorage[tempUrl];
        return Promise.resolve(`test-file-path/${folder}/${privateStorage[folder].filename}`);
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
export class TestStorageModule {}
