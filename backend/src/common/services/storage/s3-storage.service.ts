import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v4 as uuidv4 } from "uuid";
import { IStorageService } from "./storage.interface";

@Injectable()
export class S3StorageService implements IStorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private s3Client: S3Client;
  private bucketName: string;
  private endpoint: string | undefined;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>("STORAGE_REGION", "us-east-1");
    const accessKeyId = this.configService.get<string>("STORAGE_ACCESS_KEY");
    const secretAccessKey = this.configService.get<string>("STORAGE_SECRET_KEY");
    this.bucketName = this.configService.get<string>("STORAGE_BUCKET", "stashy-bucket");
    this.endpoint = this.configService.get<string>("STORAGE_ENDPOINT");

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn("Storage credentials not found. Uploads will fail.");
    }

    this.s3Client = new S3Client({
      region,
      endpoint: this.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: accessKeyId || "",
        secretAccessKey: secretAccessKey || "",
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder = "uploads"): Promise<string> {
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(command);

      if (this.endpoint) {
        return `${this.endpoint}/${this.bucketName}/${fileName}`;
      }

      const region = this.configService.get<string>("STORAGE_REGION", "us-east-1");
      return `https://${this.bucketName}.s3.${region}.amazonaws.com/${fileName}`;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${fileName}`, error);
      throw error;
    }
  }
}
