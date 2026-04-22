import { Schema, Types } from 'mongoose';

export interface User {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password_hash: string;
  role: 'student' | 'working_professional' | 'other';
  state?: string;
  city: string;
  station?: string;
  profile_picture_url: string;
  created_at: Date;
  updated_at: Date;
}

export const UserSchema = new Schema<User>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['student', 'working_professional', 'other'],
    },
    state: { type: String, required: false },
    city: { type: String, required: true },
    station: { type: String, required: false },
    profile_picture_url: { type: String, required: true },
    created_at: { type: Date, required: true },
    updated_at: { type: Date, required: true },
  },
  {
    collection: 'users',
    versionKey: false,
  },
);

