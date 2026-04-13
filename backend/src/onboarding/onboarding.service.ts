import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserProfile } from '../schemas/user-profile.schema';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectModel('UserProfile')
    private readonly userProfileModel: Model<UserProfile>,
  ) {}

  async completeOnboarding(userId: Types.ObjectId, dto: CompleteOnboardingDto) {
    const profile = await this.userProfileModel
      .findOne({ user_id: userId })
      .exec();

    if (!profile) {
      throw new InternalServerErrorException({
        error: 'PROFILE_NOT_FOUND',
        message: 'User profile not found',
      });
    }

    const defaults = {
      transport_mode: dto.transport_mode,
      avg_daily_distance_km: dto.avg_daily_distance_km,
      electricity_units_per_day: dto.electricity_units_per_day,
      ac_hours_per_day: dto.ac_hours_per_day,
      diet_type: dto.diet_type,
      meals_per_day: dto.meals_per_day,
      waste_bags_per_day: dto.waste_bags_per_day,
    };

    await this.userProfileModel.updateOne(
      { _id: profile._id },
      {
        $set: {
          onboarding_completed: true,
          onboarding_defaults: defaults,
          updated_at: new Date(),
        },
      },
    );

    return {
      message: 'Onboarding completed',
      onboarding_defaults: defaults,
    };
  }
}
