import mongoose from 'mongoose';
import {
  ACTIVITY_TYPES,
  ACTIVITY_SOURCES,
  TRAVEL_STYLES,
  TRIP_STATUSES,
  CURRENCIES,
  TRIP_MEMBER_ROLES,
} from '@pepetrip/shared';
import { toJSONClean } from './plugins.js';

const coordsSchema = new mongoose.Schema({ lat: Number, lng: Number }, { _id: false });

const moneySchema = new mongoose.Schema(
  { amount: { type: Number, min: 0 }, currency: { type: String, enum: CURRENCIES } },
  { _id: false },
);

const locationSchema = new mongoose.Schema(
  { name: String, address: String, coords: { type: coordsSchema } },
  { _id: false },
);

const activitySchema = new mongoose.Schema({
  type: { type: String, enum: ACTIVITY_TYPES, default: 'activity' },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  location: { type: locationSchema },
  startTime: { type: String },
  endTime: { type: String },
  durationMin: { type: Number, min: 0 },
  estimatedCost: { type: moneySchema },
  notes: { type: String },
  source: { type: String, enum: ACTIVITY_SOURCES, default: 'user' },
  order: { type: Number, default: 0 },
});

const daySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  date: { type: Date },
  summary: { type: String, default: '' },
  order: { type: Number, default: 0 },
  activities: { type: [activitySchema], default: [] },
});

/** Group-travel members in addition to the owner. userId is set once the invitee exists. */
const memberSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String },
    role: { type: String, enum: TRIP_MEMBER_ROLES, default: 'viewer' },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const tripSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    destination: {
      label: { type: String, required: true },
      country: { type: String },
      city: { type: String },
      coords: { type: coordsSchema },
    },
    startDate: { type: Date },
    endDate: { type: Date },
    travelers: { type: Number, default: 2, min: 1 },
    budget: { type: moneySchema },
    travelStyle: { type: String, enum: TRAVEL_STYLES },
    status: { type: String, enum: TRIP_STATUSES, default: 'draft', index: true },
    currency: { type: String, enum: CURRENCIES },
    overview: { type: String, default: '' },
    coverImage: { type: String },
    notes: { type: String },
    days: { type: [daySchema], default: [] },
    members: { type: [memberSchema], default: [] },
    lastGeneratedAt: { type: Date },
    // Public read-only sharing: opaque token in the URL; null when not shared.
    shareToken: { type: String, index: true, sparse: true },
    sharedAt: { type: Date },
  },
  { timestamps: true },
);

// Common access pattern: a user's trips, newest first.
tripSchema.index({ ownerId: 1, createdAt: -1 });
// Trips shared with a given member.
tripSchema.index({ 'members.userId': 1 });

toJSONClean(activitySchema);
toJSONClean(daySchema);
toJSONClean(memberSchema);
toJSONClean(tripSchema);

export const Trip = mongoose.model('Trip', tripSchema);
