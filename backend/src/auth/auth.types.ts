import { Types } from 'mongoose';
import { User } from '../schemas/user.schema';

export type JwtPayload = {
  sub: string;
  email: string;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: User['role'];
  state?: string;
  city: string;
  station?: string;
  profile_picture_url: string;
  created_at: Date;
  updated_at: Date;
};

/** Document shape for responses (users collection fields, excluding password_hash). */
export type UserDocumentPublic = Pick<
  User,
  | 'name'
  | 'email'
  | 'role'
  | 'state'
  | 'city'
  | 'station'
  | 'profile_picture_url'
  | 'created_at'
  | 'updated_at'
> & { _id: Types.ObjectId };
