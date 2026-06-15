import { sendData } from '../helpers/response.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import * as weatherService from '../services/weatherService.js';

export const tripWeather = asyncHandler(async (req, res) => {
  const weather = await weatherService.getTripWeather(req.valid.params.id, req.user.id);
  sendData(res, { weather });
});
