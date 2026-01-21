import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MetadataService } from "./services/metadata.service";
import { StorageModule } from "./services/storage/storage.module";

@Global()
@Module({
  imports: [ConfigModule, StorageModule],
  providers: [MetadataService],
  exports: [MetadataService, StorageModule],
})
export class CommonModule {}
