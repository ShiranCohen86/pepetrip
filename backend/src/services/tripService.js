import { tripRepository } from '../repositories/tripRepository.js';
import { User } from '../models/User.js';
import { getPagination, buildPageMeta } from '../helpers/pagination.js';
import { notFound, badRequest } from '../errors/AppError.js';
import * as aiItineraryService from './aiItineraryService.js';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Number of inclusive days between two YYYY-MM-DD / Date values. */
function daysBetween(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  return Math.round((e.getTime() - s.getTime()) / DAY_MS) + 1;
}

/** Build empty day placeholders for a date range (UTC-safe). */
function buildDaySkeleton(startDate, endDate) {
  const start = new Date(startDate);
  const count = Math.max(1, daysBetween(startDate, endDate));
  return Array.from({ length: count }, (_, i) => ({
    dayNumber: i + 1,
    order: i,
    date: new Date(start.getTime() + i * DAY_MS),
    summary: '',
    activities: [],
  }));
}

export async function createTrip(ownerId, input) {
  const title =
    input.title?.trim() || `Trip to ${input.destination.city || input.destination.label}`;
  return tripRepository.create({
    ownerId,
    title,
    destination: input.destination,
    startDate: new Date(input.startDate),
    endDate: new Date(input.endDate),
    travelers: input.travelers,
    budget: input.budget,
    travelStyle: input.travelStyle,
    notes: input.notes,
    currency: input.budget.currency,
    status: 'draft',
    days: buildDaySkeleton(input.startDate, input.endDate),
  });
}

export async function listTrips(userId, { status, page, limit }) {
  const filter = status ? { status } : {};
  const { skip } = getPagination({ page, limit });
  // Includes trips shared with the user (group travel), not just owned ones.
  const [items, total] = await Promise.all([
    tripRepository.listAccessible(userId, { filter, skip, limit }),
    tripRepository.countAccessible(userId, filter),
  ]);
  return { items, meta: buildPageMeta({ page, limit, total }) };
}

/** Load a trip the user owns, or throw 404. */
export async function getOwnedTrip(id, ownerId) {
  const trip = await tripRepository.findByIdForOwner(id, ownerId);
  if (!trip) throw notFound('Trip not found');
  return trip;
}

/** Load a trip the user can access (owner or member), or throw 404. */
export async function getAccessibleTrip(id, userId) {
  const trip = await tripRepository.findAccessible(id, userId);
  if (!trip) throw notFound('Trip not found');
  return trip;
}

/* ───────────── Group travel: members (owner-managed) ───────────── */

export async function addMember(tripId, ownerId, { email, role }) {
  const trip = await getOwnedTrip(tripId, ownerId);
  if (trip.members.some((m) => m.email === email)) {
    throw badRequest('That person is already on this trip');
  }
  const user = await User.findOne({ email });
  if (user && String(user._id) === String(ownerId)) {
    throw badRequest('You already own this trip');
  }
  trip.members.push({ email, role, userId: user?._id, name: user?.name });
  await trip.save();
  return trip;
}

export async function removeMember(tripId, ownerId, memberId) {
  const trip = await getOwnedTrip(tripId, ownerId);
  const member = trip.members.id(memberId);
  if (!member) throw notFound('Member not found');
  member.deleteOne();
  await trip.save();
  return trip;
}

export async function updateTrip(id, ownerId, patch) {
  const trip = await getOwnedTrip(id, ownerId);
  const fields = [
    'title',
    'destination',
    'startDate',
    'endDate',
    'travelers',
    'budget',
    'travelStyle',
    'status',
    'coverImage',
    'notes',
  ];
  for (const field of fields) {
    if (patch[field] === undefined) continue;
    trip[field] =
      field === 'startDate' || field === 'endDate' ? new Date(patch[field]) : patch[field];
  }
  await trip.save();
  return trip;
}

export async function deleteTrip(id, ownerId) {
  const deleted = await tripRepository.deleteByIdForOwner(id, ownerId);
  if (!deleted) throw notFound('Trip not found');
  return deleted;
}

/** Persist a drag-and-drop reorder (activities may move between days). */
export async function reorderItinerary(id, ownerId, payload) {
  const trip = await getOwnedTrip(id, ownerId);

  const activityById = new Map();
  const dayMetaById = new Map();
  for (const day of trip.days) {
    dayMetaById.set(day._id.toString(), day.toObject());
    for (const act of day.activities) activityById.set(act._id.toString(), act.toObject());
  }

  trip.days = payload.days.map((d, dayIdx) => {
    const meta = dayMetaById.get(d.id);
    if (!meta) throw badRequest(`Unknown day id: ${d.id}`);
    const activities = d.activityIds.map((aid, actIdx) => {
      const act = activityById.get(aid);
      if (!act) throw badRequest(`Unknown activity id: ${aid}`);
      return { ...act, order: actIdx };
    });
    return { ...meta, order: dayIdx, dayNumber: dayIdx + 1, activities };
  });

  await trip.save();
  return trip;
}

function getDayOr404(trip, dayId) {
  const day = trip.days.id(dayId);
  if (!day) throw notFound('Day not found');
  return day;
}

export async function addActivity(id, ownerId, dayId, input) {
  const trip = await getOwnedTrip(id, ownerId);
  const day = getDayOr404(trip, dayId);
  day.activities.push({ ...input, source: 'user', order: day.activities.length });
  await trip.save();
  return trip;
}

export async function updateActivity(id, ownerId, dayId, activityId, patch) {
  const trip = await getOwnedTrip(id, ownerId);
  const day = getDayOr404(trip, dayId);
  const activity = day.activities.id(activityId);
  if (!activity) throw notFound('Activity not found');
  activity.set(patch);
  await trip.save();
  return trip;
}

export async function deleteActivity(id, ownerId, dayId, activityId) {
  const trip = await getOwnedTrip(id, ownerId);
  const day = getDayOr404(trip, dayId);
  const activity = day.activities.id(activityId);
  if (!activity) throw notFound('Activity not found');
  activity.deleteOne();
  await trip.save();
  return trip;
}

/** Map a trip into the input the AI planner expects. */
function toAiInput(trip) {
  return {
    destination: trip.destination.label,
    country: trip.destination.country,
    city: trip.destination.city,
    startDate: trip.startDate?.toISOString().slice(0, 10),
    endDate: trip.endDate?.toISOString().slice(0, 10),
    numDays: daysBetween(trip.startDate, trip.endDate),
    travelers: trip.travelers,
    budgetAmount: trip.budget?.amount,
    currency: trip.budget?.currency ?? trip.currency,
    travelStyle: trip.travelStyle,
    notes: trip.notes,
  };
}

/** Overwrite a trip's itinerary with an AI-generated one (preserving day dates). */
export function applyItinerary(trip, ai) {
  const startMs = trip.startDate ? trip.startDate.getTime() : null;
  trip.currency = ai.currency;
  trip.overview = ai.overview || '';
  trip.days = ai.days.map((day, idx) => ({
    dayNumber: idx + 1,
    order: idx,
    date: startMs != null ? new Date(startMs + idx * DAY_MS) : undefined,
    summary: day.summary || '',
    activities: day.activities.map((a, j) => ({
      type: a.type,
      title: a.title,
      description: a.description || '',
      location: a.location,
      startTime: a.startTime,
      endTime: a.endTime,
      durationMin: a.durationMin,
      estimatedCost: a.estimatedCost,
      source: 'ai',
      order: j,
    })),
  }));
  trip.status = 'planned';
  trip.lastGeneratedAt = new Date();
  return trip;
}

/** Generate an itinerary via AI and apply it to the trip. */
export async function generateForTrip(id, ownerId) {
  const trip = await getOwnedTrip(id, ownerId);
  const ai = await aiItineraryService.generateItinerary(toAiInput(trip), {
    userId: ownerId,
    tripId: trip.id,
  });
  applyItinerary(trip, ai);
  await trip.save();
  return trip;
}
