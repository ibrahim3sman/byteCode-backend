import { Injectable, Logger } from '@nestjs/common';
import Parser from 'rss-parser';

type CustomFeed = Record<string, any>;
type CustomItem = {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet?: string;
  content?: string;
  guid?: string;
  isoDate?: string;
};

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private parser = new Parser<CustomFeed, CustomItem>({
    customFields: {
      item: [
        ['content:encoded', 'content'],
        ['description', 'contentSnippet'],
      ],
    },
    timeout: 50000,
  });

  private truncate(text: string, max = 280): string {
    if (!text) return '';
    // Strip HTML tags
    const stripped = text.replace(/<[^>]*>/g, '').trim();
    if (stripped.length <= max) return stripped;
    return stripped.slice(0, max).replace(/\s+\S*$/, '') + '…';
  }

  private detectLanguage(text: string): 'AR' | 'EN' {
    // Simple heuristic: detect Arabic Unicode range
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text) ? 'AR' : 'EN';
  }

  async getFeed(url: string, limit: number) {
    try {
      const feed = await this.parser.parseURL(url);
      return feed.items.slice(0, limit).map((item) => {
        const snippet = this.truncate(item.contentSnippet || item.content || '', 280);
        return {
          title: item.title || 'Untitled',
          link: item.link || '',
          pubDate: item.isoDate || item.pubDate || null,
          contentSnippet: snippet,
          guid: item.guid || item.link || '',
          lang: this.detectLanguage(item.title + ' ' + snippet),
        };
      });
    } catch (err) {
      this.logger.error(`Failed to fetch RSS from ${url}: ${err}`);
      return [];
    }
  }
}

