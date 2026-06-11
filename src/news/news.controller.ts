import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { NewsService } from './news.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('news')
export class NewsController {
  constructor(private newsService: NewsService) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000) // 5 minutes
  @Get('/get-rss')
  async getRss() {
    return await this.newsService.getFeed('https://news.ycombinator.com/rss', 10);
  }
}