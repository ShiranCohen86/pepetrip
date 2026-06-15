import { sendData } from '../helpers/response.js';
import { asyncHandler } from '../helpers/asyncHandler.js';
import { recordAudit } from '../middlewares/audit.js';
import * as tripService from '../services/tripService.js';

export const list = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.valid.query;
  const { items, meta } = await tripService.listTrips(req.user.id, { status, page, limit });
  sendData(res, { trips: items }, { meta });
});

export const create = asyncHandler(async (req, res) => {
  const trip = await tripService.createTrip(req.user.id, req.valid.body);
  recordAudit(req, { action: 'trip.create', entity: 'Trip', entityId: trip.id });
  sendData(res, { trip }, { status: 201 });
});

export const get = asyncHandler(async (req, res) => {
  const trip = await tripService.getAccessibleTrip(req.valid.params.id, req.user.id);
  sendData(res, { trip });
});

export const addMember = asyncHandler(async (req, res) => {
  const trip = await tripService.addMember(req.valid.params.id, req.user.id, req.valid.body);
  recordAudit(req, { action: 'trip.member.add', entity: 'Trip', entityId: trip.id });
  sendData(res, { members: trip.members }, { status: 201 });
});

export const removeMember = asyncHandler(async (req, res) => {
  const trip = await tripService.removeMember(
    req.valid.params.id,
    req.user.id,
    req.valid.params.memberId,
  );
  recordAudit(req, { action: 'trip.member.remove', entity: 'Trip', entityId: trip.id });
  sendData(res, { members: trip.members });
});

export const update = asyncHandler(async (req, res) => {
  const trip = await tripService.updateTrip(req.valid.params.id, req.user.id, req.valid.body);
  recordAudit(req, { action: 'trip.update', entity: 'Trip', entityId: trip.id });
  sendData(res, { trip });
});

export const remove = asyncHandler(async (req, res) => {
  await tripService.deleteTrip(req.valid.params.id, req.user.id);
  recordAudit(req, { action: 'trip.delete', entity: 'Trip', entityId: req.valid.params.id });
  sendData(res, { ok: true });
});

export const generate = asyncHandler(async (req, res) => {
  const trip = await tripService.generateForTrip(req.valid.params.id, req.user.id);
  recordAudit(req, { action: 'trip.generate', entity: 'Trip', entityId: trip.id });
  sendData(res, { trip });
});

export const reorder = asyncHandler(async (req, res) => {
  const trip = await tripService.reorderItinerary(req.valid.params.id, req.user.id, req.valid.body);
  sendData(res, { trip });
});

export const addActivity = asyncHandler(async (req, res) => {
  const { id, dayId } = req.valid.params;
  const trip = await tripService.addActivity(id, req.user.id, dayId, req.valid.body);
  sendData(res, { trip }, { status: 201 });
});

export const updateActivity = asyncHandler(async (req, res) => {
  const { id, dayId, activityId } = req.valid.params;
  const trip = await tripService.updateActivity(id, req.user.id, dayId, activityId, req.valid.body);
  sendData(res, { trip });
});

export const deleteActivity = asyncHandler(async (req, res) => {
  const { id, dayId, activityId } = req.valid.params;
  const trip = await tripService.deleteActivity(id, req.user.id, dayId, activityId);
  sendData(res, { trip });
});
