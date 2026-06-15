import { sendData } from '../helpers/response.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { recordAudit } from '../middlewares/audit.js';
import * as packingService from '../services/packingService.js';

export const get = asyncHandler(async (req, res) => {
  const list = await packingService.getPacking(req.valid.params.id, req.user.id);
  sendData(res, { packing: list });
});

export const generate = asyncHandler(async (req, res) => {
  const list = await packingService.generatePacking(req.valid.params.id, req.user.id);
  recordAudit(req, { action: 'packing.generate', entity: 'Trip', entityId: req.valid.params.id });
  sendData(res, { packing: list });
});

export const addItem = asyncHandler(async (req, res) => {
  const list = await packingService.addItem(req.valid.params.id, req.user.id, req.valid.body);
  sendData(res, { packing: list }, { status: 201 });
});

export const updateItem = asyncHandler(async (req, res) => {
  const list = await packingService.updateItem(
    req.valid.params.id,
    req.user.id,
    req.valid.params.itemId,
    req.valid.body,
  );
  sendData(res, { packing: list });
});

export const deleteItem = asyncHandler(async (req, res) => {
  const list = await packingService.deleteItem(
    req.valid.params.id,
    req.user.id,
    req.valid.params.itemId,
  );
  sendData(res, { packing: list });
});
