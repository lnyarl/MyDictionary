import { BadRequestException } from "@nestjs/common";
import sharp from "sharp";

const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB
const MAX_DIMENSION = 2000;
const MAX_IMAGES_PER_DEFINITION = 4;

export function countImagesInContent(content: string): number {
  const markdownImageRegex = /!\[.*?\]\(.*?\)/g;
  const htmlImageRegex = /<img.*?src=".*?".*?\/?>/g;

  const markdownMatches = content.match(markdownImageRegex) || [];
  const htmlMatches = content.match(htmlImageRegex) || [];

  return markdownMatches.length + htmlMatches.length;
}

export function validateImageCount(content: string): void {
  const count = countImagesInContent(content);
  if (count > MAX_IMAGES_PER_DEFINITION) {
    throw new BadRequestException(
      `이미지는 최대 ${MAX_IMAGES_PER_DEFINITION}개까지 업로드 가능합니다. (현재: ${count}개)`,
    );
  }
}

export async function processImage(file: Express.Multer.File): Promise<Express.Multer.File> {
  if (file.size > MAX_FILE_SIZE) {
    throw new BadRequestException(
      `파일 크기가 너무 큽니다. 최대 ${MAX_FILE_SIZE / (1024 * 1024)}MB까지 가능합니다.`,
    );
  }

  const image = sharp(file.buffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new BadRequestException("이미지 메타데이터를 읽을 수 없습니다.");
  }

  let processedBuffer: Buffer;

  if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / metadata.width, MAX_DIMENSION / metadata.height);
    const newWidth = Math.round(metadata.width * ratio);
    const newHeight = Math.round(metadata.height * ratio);

    processedBuffer = await image
      .resize(newWidth, newHeight, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();
  } else {
    processedBuffer = await image.toBuffer();
  }

  return {
    ...file,
    buffer: processedBuffer,
    size: processedBuffer.length,
  };
}

export async function processMultipleImages(
  files: Express.Multer.File[],
): Promise<Express.Multer.File[]> {
  return Promise.all(files.map((file) => processImage(file)));
}
