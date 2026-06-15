/**
 * Best-effort extraction of travel details from OCR'd / pasted document text.
 * Pure + deterministic so it's easy to test; intentionally conservative.
 */
const MONTHS = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec';

export function extractFields(text = '') {
  const flight = text.match(/\b([A-Z]{2}\d{2,4}|[A-Z]{2}\s\d{2,4})\b/);

  const confirmation = text.match(
    /\b(?:confirmation|booking|reference|reservation|PNR|conf(?:irmation)?)\b[^A-Z0-9]{0,12}([A-Z0-9]{5,8})\b/i,
  );

  const dateRe = new RegExp(
    `\\b(\\d{4}-\\d{2}-\\d{2}|\\d{1,2}[\\/.]\\d{1,2}[\\/.]\\d{2,4}|(?:${MONTHS})[a-z]*\\.?\\s+\\d{1,2},?\\s+\\d{4}|\\d{1,2}\\s+(?:${MONTHS})[a-z]*\\.?\\s+\\d{4})\\b`,
    'gi',
  );
  const dates = [...text.matchAll(dateRe)].map((m) => m[1]).slice(0, 6);

  return {
    flightNumber: flight ? flight[1].replace(/\s/g, '') : undefined,
    confirmation: confirmation ? confirmation[1] : undefined,
    dates,
  };
}
