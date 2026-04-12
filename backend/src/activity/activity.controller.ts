import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { UserDocumentPublic } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActivityService } from './activity.service';
import { CreateDailyActivityDto } from './dto/create-daily-activity.dto';

type RequestWithUser = Request & { user: UserDocumentPublic };

@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post('daily')
  submitDailyActivity(
    @Req() req: RequestWithUser,
    @Body() dto: CreateDailyActivityDto,
  ) {
    return this.activityService.submitDailyActivity(req.user._id, dto);
  }
}
