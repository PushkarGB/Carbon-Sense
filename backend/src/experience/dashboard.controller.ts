import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import type { RequestUser } from './experience.types';

type RequestWithUser = Request & { user: RequestUser };

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('home')
  getHome(@Req() req: RequestWithUser) {
    return this.dashboardService.getHome(req.user._id);
  }
}
