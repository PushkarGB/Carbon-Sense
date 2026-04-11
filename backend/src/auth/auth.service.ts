import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../schemas/user.schema';
import { JwtPayload, PublicUser, UserDocumentPublic } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
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
    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      password_hash,
      role: dto.role,
      city: dto.city,
      profile_picture_url: dto.profile_picture_url,
      created_at: now,
      updated_at: now,
    });
    return {
      access_token: this.signToken(user._id, user.email),
      user: this.toPublicUser(user),
    };
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
