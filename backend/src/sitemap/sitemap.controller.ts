import { Controller, Get, Header } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Public } from "../common/decorators/public.decorator";
import { SitemapService } from "./sitemap.service";

@Controller()
export class SitemapController {
  constructor(
    private readonly sitemapService: SitemapService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get("/sitemap.xml")
  @Header("Content-Type", "application/xml")
  async getSitemap(): Promise<string> {
    const baseUrl = this.configService.get("FRONTEND_URL") || "https://stashy.app";

    const [wordItems, termItems] = await Promise.all([
      this.sitemapService.getWordsForSitemap(),
      this.sitemapService.getTermsForSitemap(),
    ]);

    const staticItems = [
      { url: "/", lastmod: new Date().toISOString(), changefreq: "daily", priority: 1.0 },
      { url: "/feed/all", lastmod: new Date().toISOString(), changefreq: "daily", priority: 0.9 },
    ];

    const allItems = [...staticItems, ...wordItems, ...termItems];

    return this.sitemapService.generateSitemapXml(allItems, baseUrl);
  }

  @Public()
  @Get("/robots.txt")
  @Header("Content-Type", "text/plain")
  getRobotsTxt(): string {
    const baseUrl = this.configService.get("FRONTEND_URL") || "https://stashy.app";
    return this.sitemapService.generateRobotsTxt(baseUrl);
  }
}
