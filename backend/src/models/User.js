import mongoose from 'mongoose';
import { USER_ROLES, UNIT_SYSTEMS, THEMES, CURRENCIES, DEFAULT_CURRENCY } from '@pepetrip/shared';
import { toJSONClean } from './plugins.js';

const preferencesSchema = new mongoose.Schema(
  {
    currency: { type: String, enum: CURRENCIES, default: DEFAULT_CURRENCY },
    units: { type: String, enum: UNIT_SYSTEMS, default: 'metric' },
    theme: { type: String, enum: THEMES, default: 'system' },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, trim: true },
    avatarUrl: { type: String },
    roles: { type: [String], enum: USER_ROLES, default: ['user'] },
    preferences: { type: preferencesSchema, default: () => ({}) },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

toJSONClean(userSchema);

export const User = mongoose.model('User', userSchema);
