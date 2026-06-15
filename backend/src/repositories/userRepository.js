import { User } from '../models/User.js';

export const userRepository = {
  findById: (id) => User.findById(id),
  findByGoogleId: (googleId) => User.findOne({ googleId }),
  findByEmail: (email) => User.findOne({ email: email.toLowerCase() }),
  create: (data) => User.create(data),
  touchLogin: (id) => User.findByIdAndUpdate(id, { lastLoginAt: new Date() }, { new: true }),
  updatePreferences: (id, preferences) =>
    User.findByIdAndUpdate(
      id,
      {
        $set: Object.fromEntries(
          Object.entries(preferences).map(([k, v]) => [`preferences.${k}`, v]),
        ),
      },
      { new: true, runValidators: true },
    ),
};
