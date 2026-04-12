import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { Types } from 'mongoose';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('app/open')
  @UseGuards(JwtAuthGuard)
  async handleAppOpen(@Req() req: Request) {
    const user = req.user as { _id: Types.ObjectId };
    return this.appService.handleAppOpen(user._id);
  }
}
