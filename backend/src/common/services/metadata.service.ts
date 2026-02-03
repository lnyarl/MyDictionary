import { Injectable } from "@nestjs/common";
import ogs from "open-graph-scraper";

export type UrlMetadata = {
  url: string;
  type: "image" | "video" | "website" | "article" | "unknown";
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
};

@Injectable()
export class MetadataService {
  async extractMetadata(url: string): Promise<UrlMetadata> {
    try {
      const { result } = await ogs({ url });

      let type: UrlMetadata["type"] = "unknown";
      if (result.ogType?.startsWith("image")) type = "image";
      else if (result.ogType?.startsWith("video")) type = "video";
      else if (result.ogType?.includes("article")) type = "article";
      else if (result.ogType?.includes("website")) type = "website";

      // Fallback detection
      if (type === "unknown") {
        if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) type = "image";
        else if (url.match(/\.(mp4|webm|mov)$/i)) type = "video";
      }

      const imageUrl = result.ogImage?.[0]?.url;

      return {
        url,
        type,
        title: result.ogTitle,
        description: result.ogDescription,
        image: imageUrl,
        siteName: result.ogSiteName,
      };
    } catch (error) {
      console.error(`Failed to extract metadata for ${url}`, error);
      // Return basic info on failure
      return {
        url,
        type: "unknown",
      };
    }
  }
}
