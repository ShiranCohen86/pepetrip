import { Type } from '@google/genai';
import { PACKING_CATEGORIES, TRAVEL_STYLE_LABELS } from '@pepetrip/shared';

export const PACKING_PROMPT_VERSION = 'v1';

/** Gemini structured-output schema for a packing list. */
export const packingResponseSchema = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          category: { type: Type.STRING, enum: PACKING_CATEGORIES },
          qty: { type: Type.NUMBER, description: 'Optional quantity, omit if 1.' },
        },
        required: ['label', 'category'],
      },
    },
  },
  required: ['items'],
};

const SYSTEM_INSTRUCTION = `You are a meticulous travel-packing assistant. Given a trip, produce a practical, de-duplicated packing checklist.
Rules:
- Tailor items to the destination, season/weather, trip length, traveler count, and travel style.
- Group every item into one of these categories: essentials, clothing, toiletries, electronics, documents, health, misc.
- Scale clothing quantities to the trip length (do not list one item per day for long trips — be reasonable).
- Include trip-specific items the traveler might forget (adapters for the region, weather gear, etc.).
- 20 to 60 items total. Keep labels short. Return ONLY structured JSON matching the schema.`;

export function buildPackingPrompt(input) {
  const styleLabel = TRAVEL_STYLE_LABELS[input.travelStyle] ?? input.travelStyle;
  const lines = [
    `Trip: ${input.numDays}-day trip to ${input.destination}.`,
    input.startDate ? `Dates: ${input.startDate} to ${input.endDate}.` : null,
    `Travelers: ${input.travelers}.`,
    `Travel style: ${styleLabel}.`,
    input.notes ? `Notes: ${input.notes}` : null,
  ].filter(Boolean);
  return { system: SYSTEM_INSTRUCTION, user: lines.join('\n') };
}
