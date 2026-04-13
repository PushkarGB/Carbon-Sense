import { Types } from 'mongoose';
import { User } from '../schemas/user.schema';

export type RequestUser = Pick<
  User,
  | 'name'
  | 'email'
  | 'role'
  | 'city'
  | 'profile_picture_url'
  | 'created_at'
  | 'updated_at'
> & { _id: Types.ObjectId };

export function toPublicUser(user: RequestUser) {
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
