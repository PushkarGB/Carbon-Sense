import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnboardingService } from './onboarding.service';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';

type RequestWithUser = Request & { user: { _id: Types.ObjectId } };

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('complete')
  completeOnboarding(
    @Req() req: RequestWithUser,
    @Body() dto: CompleteOnboardingDto,
  ) {
    return this.onboardingService.completeOnboarding(req.user._id, dto);
  }
}
