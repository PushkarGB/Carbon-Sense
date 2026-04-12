import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { UserDocumentPublic } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LeaderboardComputationService } from './leaderboard-computation.service';

type RequestWithUser = Request & { user: UserDocumentPublic };

@Controller('leaderboard')
@UseGuards(JwtAuthGuard)
export class LeaderboardController {
  constructor(
    private readonly leaderboardComputation: LeaderboardComputationService,
  ) {}

  /** Execution Flow (v1.2) §9 — manual recompute for the current user. */
  @Post('refresh')
  async refresh(@Req() req: RequestWithUser) {
    const result = await this.leaderboardComputation.recomputeForUser(
      req.user._id,
    );
    return {
      message: 'Leaderboard refreshed',
      updated_at: result.updated_at,
    };
  }
}
