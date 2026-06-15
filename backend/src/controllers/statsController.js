import { sendData } from '../helpers/response.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import * as statsService from '../services/statsService.js';
import * as achievementsService from '../services/achievementsService.js';

export const get = asyncHandler(async (req, res) => {
  const stats = await statsService.getStats(req.user.id);
  sendData(res, { stats });
});

export const achievements = asyncHandler(async (req, res) => {
  const result = await achievementsService.getAchievements(req.user.id);
  sendData(res, result);
});
