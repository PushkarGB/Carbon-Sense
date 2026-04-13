import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProfileSchema } from '../schemas/user-profile.schema';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'UserProfile', schema: UserProfileSchema },
    ]),
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
