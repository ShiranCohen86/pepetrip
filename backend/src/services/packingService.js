import { z } from 'zod';
import { aiPackingListSchema } from '@pepetrip/shared';
import { PackingList } from '../models/PackingList.js';
import { getOwnedTrip } from './tripService.js';
import { getAiProvider } from './ai/index.js';
import { PACKING_PROMPT_VERSION } from './ai/packingPrompt.js';
import { aiGenerationRepository } from '../repositories/aiGenerationRepository.js';
import { stableHash } from '../utils/crypto.js';
import { config } from '../config/env.js';
import { notFound, serviceUnavailable, badRequest } from '../errors/AppError.js';
import { logger } from '../config/logger.js';

const DAY_MS = 86_400_000;
const MAX_ATTEMPTS = 3;
const backoff = (attempt) => new Promise((r) => setTimeout(r, 400 * 2 ** (attempt - 1)));

function tripToInput(trip) {
  const numDays =
    trip.days?.length ||
    (trip.startDate && trip.endDate
      ? Math.round((new Date(trip.endDate) - new Date(trip.startDate)) / DAY_MS) + 1
      : 3);
  return {
    destination: trip.destination?.label,
    numDays,
    travelers: trip.travelers ?? 2,
    travelStyle: trip.travelStyle,
    startDate: trip.startDate ? new Date(trip.startDate).toISOString().slice(0, 10) : null,
    endDate: trip.endDate ? new Date(trip.endDate).toISOString().slice(0, 10) : null,
    notes: trip.notes,
  };
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        /* fall through */
      }
    }
    throw badRequest('AI returned unparseable output');
  }
}

/** Generate a validated packing list, cached by a stable hash of the input. */
async function aiPackingList(input, { userId, tripId }) {
  const model = config.GEMINI_MODEL;
  const inputHash = stableHash({ kind: 'packing', v: PACKING_PROMPT_VERSION, model, input });

  const cached = await aiGenerationRepository.findByInputHash(inputHash, model);
  if (cached?.result) return cached.result;

  const provider = getAiProvider();
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const { raw, tokensUsed } = await provider.generatePackingList(input);
      const list = aiPackingListSchema.parse(parseJson(raw));
      await aiGenerationRepository.create({
        userId,
        tripId,
        inputHash,
        model,
        promptVersion: PACKING_PROMPT_VERSION,
        result: list,
        tokensUsed,
      });
      return list;
    } catch (err) {
      lastErr = err;
      const status = err?.status ?? err?.response?.status;
      const retriable = err instanceof z.ZodError || status === 429 || status >= 500;
      logger.warn({ attempt, status, err: err.message }, 'packing generation attempt failed');
      if (!retriable || attempt === MAX_ATTEMPTS) break;
      await backoff(attempt);
    }
  }
  if ((lastErr?.status ?? lastErr?.response?.status) === 429) {
    throw serviceUnavailable('The AI is busy right now (rate limit). Please try again shortly.');
  }
  throw serviceUnavailable('Could not generate a packing list right now. Please try again.');
}

export async function getPacking(tripId, ownerId) {
  await getOwnedTrip(tripId, ownerId);
  return (await PackingList.findOne({ tripId, ownerId })) ?? { tripId, ownerId, items: [] };
}

export async function generatePacking(tripId, ownerId) {
  const trip = await getOwnedTrip(tripId, ownerId);
  const ai = await aiPackingList(tripToInput(trip), { userId: ownerId, tripId });

  const existing = await PackingList.findOne({ tripId, ownerId });
  // Preserve "packed" state for items whose label survives a regeneration.
  const packedLabels = new Set(
    (existing?.items ?? []).filter((i) => i.packed).map((i) => i.label.toLowerCase()),
  );
  const items = ai.items.map((i) => ({
    label: i.label,
    category: i.category,
    qty: i.qty,
    source: 'ai',
    packed: packedLabels.has(i.label.toLowerCase()),
  }));

  if (existing) {
    existing.items = items;
    existing.generatedAt = new Date();
    await existing.save();
    return existing;
  }
  return PackingList.create({ tripId, ownerId, items, generatedAt: new Date() });
}

async function ownedList(tripId, ownerId) {
  await getOwnedTrip(tripId, ownerId);
  let list = await PackingList.findOne({ tripId, ownerId });
  if (!list) list = await PackingList.create({ tripId, ownerId, items: [] });
  return list;
}

export async function addItem(tripId, ownerId, input) {
  const list = await ownedList(tripId, ownerId);
  list.items.push({ ...input, source: 'user', packed: false });
  await list.save();
  return list;
}

export async function updateItem(tripId, ownerId, itemId, patch) {
  const list = await ownedList(tripId, ownerId);
  const item = list.items.id(itemId);
  if (!item) throw notFound('Packing item not found');
  for (const field of ['label', 'category', 'qty', 'packed']) {
    if (patch[field] !== undefined) item[field] = patch[field];
  }
  await list.save();
  return list;
}

export async function deleteItem(tripId, ownerId, itemId) {
  const list = await ownedList(tripId, ownerId);
  const item = list.items.id(itemId);
  if (!item) throw notFound('Packing item not found');
  item.deleteOne();
  await list.save();
  return list;
}
