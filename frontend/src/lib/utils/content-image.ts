const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB
const MAX_DIMENSION = 2000;

export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageValidationError";
  }
}

function validateFileSize(file: File): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new ImageValidationError(
      `파일 크기가 너무 큽니다. 최대 ${MAX_FILE_SIZE / (1024 * 1024)}MB까지 가능합니다.`,
    );
  }
}

function resizeToMaxDimension(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  const ratio = Math.min(maxDimension / width, maxDimension / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

export function processContentImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    try {
      validateFileSize(file);
    } catch (error) {
      reject(error);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const { width, height } = resizeToMaxDimension(img.width, img.height, MAX_DIMENSION);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new ImageValidationError("Canvas context 생성에 실패했습니다."));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new ImageValidationError("이미지 변환에 실패했습니다."));
            return;
          }

          const processedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });

          resolve(processedFile);
        },
        file.type,
        1.0,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new ImageValidationError("이미지 로드에 실패했습니다."));
    };

    img.src = objectUrl;
  });
}

export function countImagesInContent(content: string): number {
  const markdownImageRegex = /!\[.*?\]\(.*?\)/g;
  const htmlImageRegex = /<img.*?src=".*?".*?\/?>/g;

  const markdownMatches = content.match(markdownImageRegex) || [];
  const htmlMatches = content.match(htmlImageRegex) || [];

  return markdownMatches.length + htmlMatches.length;
}

export function validateImageCount(content: string, maxCount = 4): boolean {
  const count = countImagesInContent(content);
  return count <= maxCount;
}

export function getImageCountError(currentCount: number, maxCount = 4): string {
  return `이미지는 최대 ${maxCount}개까지 업로드 가능합니다. (현재: ${currentCount}개)`;
}

export async function processMultipleContentImages(
  files: File[],
  onProgress?: (current: number, total: number) => void,
): Promise<File[]> {
  const processedFiles: File[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const processed = await processContentImage(file);
    processedFiles.push(processed);
    onProgress?.(i + 1, files.length);
  }

  return processedFiles;
}
