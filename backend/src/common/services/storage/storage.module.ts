import { Global, Module, Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3StorageService } from "./s3-storage.service";
import { IStorageService, STORAGE_SERVICE } from "./storage.interface";

const storageProvider: Provider = {
  provide: STORAGE_SERVICE,
  useFactory: (configService: ConfigService): IStorageService => {
    return new S3StorageService(configService);
  },
  inject: [ConfigService],
};

@Global()
@Module({
  providers: [storageProvider],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
