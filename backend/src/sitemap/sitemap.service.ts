import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../common/database/base.repository";

interface SitemapItem {
  url: string;
  lastmod: string;
  changefreq: string;
  priority: number;
}

@Injectable()
export class SitemapService extends BaseRepository {
  async getWordsForSitemap(limit = 50000): Promise<SitemapItem[]> {
    const words = await this.query("words")
      .select([`words.term`, `words.updated_at as updatedAt`])
      .whereExists(function () {
        this.select("*")
          .from("definitions")
          .whereRaw(`definitions.word_id = words.id`)
          .andWhere(`definitions.is_public`, true)
          .whereNull(`definitions.deleted_at`);
      })
      .whereNull(`words.deleted_at`)
      .orderBy(`words.updated_at`, "desc")
      .limit(limit);

    return words.map((word) => ({
      url: `/word/${encodeURIComponent(word.term)}`,
      lastmod: new Date(word.updatedAt).toISOString(),
      changefreq: "weekly",
      priority: 0.8,
    }));
  }

  async getTermsForSitemap(limit = 50000): Promise<SitemapItem[]> {
    const terms = await this.query("terms")
      .select([`terms.text`, `terms.updated_at as updatedAt`])
      .whereExists(function () {
        this.select("*")
          .from("definitions")
          .whereRaw(`definitions.term_id = terms.id`)
          .andWhere(`definitions.is_public`, true)
          .whereNull(`definitions.deleted_at`);
      })
      .whereNull(`terms.deleted_at`)
      .orderBy(`terms.updated_at`, "desc")
      .limit(limit);

    return terms.map((term) => ({
      url: `/term/${encodeURIComponent(term.text)}`,
      lastmod: new Date(term.updatedAt).toISOString(),
      changefreq: "weekly",
      priority: 0.7,
    }));
  }

  generateSitemapXml(items: SitemapItem[], baseUrl: string): string {
    const urls = items
      .map(
        (item) => `
  <url>
    <loc>${baseUrl}${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`,
      )
      .join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
  }

  generateRobotsTxt(baseUrl: string): string {
    return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
  }
}
