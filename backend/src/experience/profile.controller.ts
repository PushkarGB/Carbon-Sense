import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfileService } from './profile.service';
import type { RequestUser } from './experience.types';

type RequestWithUser = Request & { user: RequestUser };

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  getMe(@Req() req: RequestWithUser) {
    return this.profileService.getMe(req.user._id);
  }

  @Put('station')
  setStation(@Req() req: RequestWithUser, @Body('station') station: string) {
    return this.profileService.setStation(req.user._id, station);
  }
}
