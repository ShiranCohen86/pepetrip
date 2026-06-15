import { sendData } from '../helpers/response.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import * as integrationsService from '../services/integrationsService.js';

export const list = asyncHandler(async (_req, res) => {
  sendData(res, { integrations: integrationsService.listIntegrations() });
});

export const sync = asyncHandler(async (req, res) => {
  const result = integrationsService.runSync(req.valid.params.key);
  sendData(res, { result });
});
