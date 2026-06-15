import { z } from 'zod';
import { aiItinerarySchema, CURRENCIES, DEFAULT_CURRENCY } from '@pepetrip/shared';
import { getAiProvider } from './ai/index.js';
import { PROMPT_VERSION } from './ai/prompt.js';
import { aiGenerationRepository } from '../repositories/aiGenerationRepository.js';
import { stableHash } from '../utils/crypto.js';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';
import { serviceUnavailable, badRequest } from '../errors/AppError.js';

const MAX_ATTEMPTS = 3;

/** Force a single trip currency onto the result and drop malformed cost objects. */
function normalize(parsed, input) {
  const currency = CURRENCIES.includes(input.currency) ? input.currency : DEFAULT_CURRENCY;
  parsed.currency = currency;
  for (const day of parsed.days ?? []) {
    for (const act of day.activities ?? []) {
      if (act.estimatedCost && typeof act.estimatedCost.amount === 'number') {
        act.estimatedCost.currency = currency;
      } else {
        delete act.estimatedCost;
      }
      if (act.location && !act.location.name && !act.location.address) delete act.location;
    }
  }
  return parsed;
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/); // tolerate code fences / stray prose
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

const backoff = (attempt) =>
  new Promise((r) => setTimeout(r, 500 * 2 ** (attempt - 1) + Math.floor(Math.random() * 250)));

/**
 * Generate a validated itinerary for the given normalized input. Caches by a
 * stable hash of the input so identical requests don't re-spend the AI quota.
 */
export async function generateItinerary(input, { userId, tripId } = {}) {
  const model = config.GEMINI_MODEL;
  const inputHash = stableHash({ v: PROMPT_VERSION, model, input });

  const cached = await aiGenerationRepository.findByInputHash(inputHash, model);
  if (cached?.result) {
    logger.debug({ tripId }, 'AI itinerary served from cache');
    return cached.result;
  }

  const provider = getAiProvider();
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const { raw, tokensUsed } = await provider.generateItinerary(input);
      const itinerary = aiItinerarySchema.parse(normalize(parseJson(raw), input));
      await aiGenerationRepository.create({
        userId,
        tripId,
        inputHash,
        model,
        promptVersion: PROMPT_VERSION,
        result: itinerary,
        tokensUsed,
      });
      return itinerary;
    } catch (err) {
      lastErr = err;
      const status = err?.status ?? err?.response?.status;
      const retriable = err instanceof z.ZodError || status === 429 || status >= 500;
      logger.warn({ attempt, status, err: err.message }, 'AI generation attempt failed');
      if (!retriable || attempt === MAX_ATTEMPTS) break;
      await backoff(attempt);
    }
  }

  const status = lastErr?.status ?? lastErr?.response?.status;
  if (status === 429) {
    throw serviceUnavailable('The AI is busy right now (rate limit). Please try again shortly.');
  }
  throw serviceUnavailable('Could not generate an itinerary right now. Please try again.');
}
