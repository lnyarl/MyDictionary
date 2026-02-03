import {
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v4 as uuidv4 } from "uuid";
import { IStorageService } from "./storage.interface";

@Injectable()
export class S3StorageService implements IStorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private s3Client: S3Client;
  private bucketName: string;
  private tempBucketName: string;
  private endpoint: string | undefined;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>("STORAGE_REGION", "us-east-1");
    const accessKeyId = this.configService.get<string>("STORAGE_ACCESS_KEY");
    const secretAccessKey = this.configService.get<string>("STORAGE_SECRET_KEY");
    this.bucketName = this.configService.get<string>("STORAGE_BUCKET", "stashy-bucket");
    this.tempBucketName = this.configService.get<string>(
      "STORAGE_TEMP_BUCKET",
      "stashy-temp-bucket",
    );
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
    return this.uploadToBucket(file, this.bucketName, folder);
  }

  async uploadTempFile(file: Express.Multer.File, folder = "temp"): Promise<string> {
    return this.uploadToBucket(file, this.tempBucketName, folder);
  }

  private async uploadToBucket(
    file: Express.Multer.File,
    bucket: string,
    folder: string,
  ): Promise<string> {
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(command);

      if (this.endpoint) {
        return `${this.endpoint}/${bucket}/${fileName}`;
      }

      const region = this.configService.get<string>("STORAGE_REGION", "us-east-1");
      return `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;
    } catch (error) {
      this.logger.error(`Failed to upload file to ${bucket}: ${fileName}`, error);
      throw error;
    }
  }

  async moveFileToPermanent(tempUrl: string, folder = "uploads"): Promise<string> {
    let key: string;
    if (this.endpoint) {
      const parts = tempUrl.split(`${this.tempBucketName}/`);
      if (parts.length < 2) throw new Error("Invalid temp URL format");
      key = parts[1];
    } else {
      const parts = tempUrl.split(".amazonaws.com/");
      if (parts.length < 2) throw new Error("Invalid temp URL format");
      key = parts[1];
    }

    key = decodeURIComponent(key);

    const newKey = `${folder}/${key.split("/").pop()}`;

    try {
      const copyCommand = new CopyObjectCommand({
        CopySource: `${this.tempBucketName}/${key}`,
        Bucket: this.bucketName,
        Key: newKey,
      });
      await this.s3Client.send(copyCommand);

      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.tempBucketName,
        Key: key,
      });
      await this.s3Client.send(deleteCommand);

      if (this.endpoint) {
        return `${this.endpoint}/${this.bucketName}/${newKey}`;
      }
      const region = this.configService.get<string>("STORAGE_REGION", "us-east-1");
      return `https://${this.bucketName}.s3.${region}.amazonaws.com/${newKey}`;
    } catch (error) {
      this.logger.error(`Failed to move file from temp to perm: ${tempUrl}`, error);
      throw error;
    }
  }
}
