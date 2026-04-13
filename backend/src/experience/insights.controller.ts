import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InsightsService } from './insights.service';
import type { RequestUser } from './experience.types';
import { GetInsightsDto } from './dto/get-insights.dto';

type RequestWithUser = Request & { user: RequestUser };

@Controller('insights')
@UseGuards(JwtAuthGuard)
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('summary')
  getSummary(
    @Req() req: RequestWithUser,
    @Query() query: GetInsightsDto,
  ) {
    return this.insightsService.getSummary(req.user._id, query.range_days ?? 7);
  }
}
