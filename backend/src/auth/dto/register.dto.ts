import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(['student', 'working_professional', 'other'] as const)
  role: 'student' | 'working_professional' | 'other';

  @IsString()
  @IsNotEmpty()
  state?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  profile_picture_url: string;
}
