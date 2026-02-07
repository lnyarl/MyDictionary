/**
 * Process an image file for profile picture upload.
 * Crops to center square and resizes to target dimensions.
 *
 * @param file - The original image file
 * @param targetSize - Target size in pixels (default: 256 for retina quality)
 * @returns Promise<File> - The processed image file
 */
export function processProfileImage(file: File, targetSize = 256): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Calculate center crop dimensions
      const minDimension = Math.min(img.width, img.height);
      const sourceX = (img.width - minDimension) / 2;
      const sourceY = (img.height - minDimension) / 2;

      // Create canvas
      const canvas = document.createElement("canvas");
      canvas.width = targetSize;
      canvas.height = targetSize;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Enable high-quality image scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw cropped and resized image
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        minDimension,
        minDimension,
        0,
        0,
        targetSize,
        targetSize,
      );

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create blob from canvas"));
            return;
          }

          // Create new file from blob
          const processedFile = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          resolve(processedFile);
        },
        "image/jpeg",
        0.9, // 90% quality for JPEG
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}
