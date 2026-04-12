import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../schemas/user.schema';
import { UserProfile } from '../schemas/user-profile.schema';
import { JwtPayload, PublicUser, UserDocumentPublic } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const BCRYPT_ROUNDS = 10;
const UNSET_PROFILE_DATE = '1970-01-01';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('UserProfile')
    private readonly userProfileModel: Model<UserProfile>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{
    access_token: string;
    user: PublicUser;
  }> {
    const existing = await this.userModel.findOne({ email: dto.email }).exec();
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const password_hash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const now = new Date();
    const session = await this.userModel.db.startSession();

    try {
      session.startTransaction();

      const user = new this.userModel({
        city: dto.city,
        created_at: now,
        email: dto.email,
        name: dto.name,
        password_hash,
        profile_picture_url: dto.profile_picture_url,
        role: dto.role,
        updated_at: now,
      });
      await user.save({ session });

      const userProfile = new this.userProfileModel({
        behavior_profile: {
          avg_ac_hours: 0,
          avg_distance: 0,
          avg_energy_usage: 0,
          avg_transport_mode: '',
          eco_action_score: 0,
        },
        created_at: now,
        engagement_metrics: {
          app_open_count: 0,
          task_completion_rate: 0,
          total_days_logged: 0,
        },
        last_streak_update: UNSET_PROFILE_DATE,
        last_submission_date: UNSET_PROFILE_DATE,
        onboarding_completed: true,
        performance_metrics: {
          baseline_emission: 0,
          baseline_status: 'pending',
          current_avg_emission: 0,
          reduction_percent: 0,
        },
        streak_days: 0,
        task_stats: {
          awareness: 0,
          eco_action: 0,
          emission_reduction: 0,
        },
        updated_at: now,
        user_id: user._id,
      });
      await userProfile.save({ session });

      await session.commitTransaction();

      return {
        access_token: this.signToken(user._id, user.email),
        user: this.toPublicUser(user),
      };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException(
        'Unable to complete registration',
      );
    } finally {
      await session.endSession();
    }
  }

  async login(dto: LoginDto): Promise<{
    access_token: string;
    user: PublicUser;
  }> {
    const user = await this.userModel.findOne({ email: dto.email }).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const ok = await bcrypt.compare(dto.password, user.password_hash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return {
      access_token: this.signToken(user._id, user.email),
      user: this.toPublicUser(user),
    };
  }

  toPublicUser(user: UserDocumentPublic): PublicUser {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      city: user.city,
      profile_picture_url: user.profile_picture_url,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  private signToken(userId: Types.ObjectId, email: string): string {
    const payload: JwtPayload = { sub: userId.toString(), email };
    return this.jwtService.sign(payload);
  }
}
