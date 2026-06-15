import { sendData } from '../helpers/response.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { recordAudit } from '../middlewares/audit.js';
import * as photoService from '../services/photoService.js';

export const list = asyncHandler(async (req, res) => {
  const photos = await photoService.listPhotos(req.valid.params.id, req.user.id);
  sendData(res, { photos });
});

export const create = asyncHandler(async (req, res) => {
  const photo = await photoService.addPhoto(
    req.valid.params.id,
    req.user.id,
    req.file,
    req.valid.body,
  );
  recordAudit(req, { action: 'photo.add', entity: 'Photo', entityId: photo.id });
  sendData(res, { photo }, { status: 201 });
});

export const remove = asyncHandler(async (req, res) => {
  await photoService.deletePhoto(req.valid.params.photoId, req.user.id);
  sendData(res, { ok: true });
});
