import { Type } from '@google/genai';
import { ACTIVITY_TYPES, TRAVEL_STYLE_LABELS } from '@pepetrip/shared';

export const PROMPT_VERSION = 'v1';

/** Gemini structured-output schema. Kept minimal; currency is applied server-side. */
export const itineraryResponseSchema = {
  type: Type.OBJECT,
  properties: {
    overview: { type: Type.STRING, description: 'A 1-2 sentence summary of the trip vibe.' },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: 'Short theme for the day.' },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ACTIVITY_TYPES },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                location: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    address: { type: Type.STRING },
                  },
                },
                startTime: { type: Type.STRING, description: '24h HH:MM' },
                endTime: { type: Type.STRING, description: '24h HH:MM' },
                durationMin: { type: Type.NUMBER },
                estimatedCost: {
                  type: Type.OBJECT,
                  properties: { amount: { type: Type.NUMBER } },
                },
              },
              required: ['type', 'title', 'description'],
            },
          },
        },
        required: ['summary', 'activities'],
      },
    },
  },
  required: ['overview', 'days'],
};

const SYSTEM_INSTRUCTION = `You are an expert local travel planner. You design realistic, well-paced day-by-day itineraries.
Rules:
- Produce EXACTLY the requested number of days.
- 3 to 6 activities per day, in chronological order, with sensible HH:MM start/end times.
- Respect realistic opening hours, travel time between stops, and meal times (include restaurants/cafes).
- Match the traveler's budget and style; keep estimated costs realistic and in the trip's currency (numbers only).
- Mix iconic sights with at least one lesser-known local pick per day; group nearby places to reduce backtracking.
- Keep descriptions concise (one sentence). Do not invent exact street addresses you are unsure of.
- Return ONLY structured JSON matching the provided schema — no commentary.`;

/** Build the system + user prompt for a normalized trip input. */
export function buildPrompt(input) {
  const styleLabel = TRAVEL_STYLE_LABELS[input.travelStyle] ?? input.travelStyle;
  const lines = [
    `Plan a ${input.numDays}-day trip to ${input.destination}.`,
    input.startDate ? `Dates: ${input.startDate} to ${input.endDate}.` : null,
    `Travelers: ${input.travelers}.`,
    `Travel style: ${styleLabel}.`,
    input.budgetAmount
      ? `Total budget: ~${input.budgetAmount} ${input.currency} for the whole trip.`
      : `Currency: ${input.currency}.`,
    input.notes ? `Extra preferences from the traveler: ${input.notes}` : null,
    `Currency for all costs: ${input.currency}.`,
  ].filter(Boolean);

  return { system: SYSTEM_INSTRUCTION, user: lines.join('\n') };
}
