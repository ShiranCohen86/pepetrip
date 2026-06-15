import { createApp } from '../src/app.js';
import { signAccessToken } from '../src/services/tokenService.js';
import { User } from '../src/models/User.js';

export const app = createApp();

let counter = 0;
export async function makeUser(overrides = {}) {
  counter += 1;
  return User.create({
    email: `user${counter}@example.com`,
    name: `User ${counter}`,
    googleId: `google-${counter}`,
    ...overrides,
  });
}

export const authHeader = (user) => `Bearer ${signAccessToken(user)}`;

export const validTripBody = {
  destination: { label: 'Kyoto, Japan' },
  startDate: '2026-09-01',
  endDate: '2026-09-03',
  travelers: 2,
  budget: { amount: 1500, currency: 'USD' },
  travelStyle: 'food',
};
