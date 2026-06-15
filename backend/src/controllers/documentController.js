import { sendData } from '../helpers/response.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { recordAudit } from '../middlewares/audit.js';
import * as documentService from '../services/documentService.js';

export const list = asyncHandler(async (req, res) => {
  const documents = await documentService.listDocuments(req.valid.params.id, req.user.id);
  sendData(res, { documents });
});

export const create = asyncHandler(async (req, res) => {
  const document = await documentService.addDocument(
    req.valid.params.id,
    req.user.id,
    req.file,
    req.valid.body,
  );
  recordAudit(req, { action: 'document.add', entity: 'Document', entityId: document.id });
  sendData(res, { document }, { status: 201 });
});

export const extract = asyncHandler(async (req, res) => {
  const document = await documentService.extractDocument(
    req.valid.params.docId,
    req.user.id,
    req.valid.body.text,
  );
  sendData(res, { document });
});

export const remove = asyncHandler(async (req, res) => {
  await documentService.deleteDocument(req.valid.params.docId, req.user.id);
  sendData(res, { ok: true });
});
