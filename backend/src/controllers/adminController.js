import { sendData } from '../helpers/response.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import * as adminService from '../services/adminService.js';

export const overview = asyncHandler(async (_req, res) => {
  const data = await adminService.getOverview();
  sendData(res, data);
});

export const users = asyncHandler(async (req, res) => {
  const { items, meta } = await adminService.listUsers(req.valid.query);
  sendData(res, { users: items }, { meta });
});
