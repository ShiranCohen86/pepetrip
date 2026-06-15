// Client-side itinerary export helpers (no dependencies).

const pad = (n) => String(n).padStart(2, '0');

const icsDateTime = (d) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(
    d.getMinutes(),
  )}00`;

const icsDate = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

const escapeIcs = (s) =>
  String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

const HHMM = /^(\d{1,2}):(\d{2})/;

/** Build an iCalendar (.ics) string: one VEVENT per dated activity. */
export function buildIcs(trip) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PepeTrip//Itinerary//EN',
    'CALSCALE:GREGORIAN',
  ];
  const stamp = icsDateTime(new Date());
  let seq = 0;

  for (const day of trip.days ?? []) {
    if (!day.date) continue;
    for (const act of day.activities ?? []) {
      const uid = `${trip.id}-${day.id}-${act.id ?? seq}@pepetrip`;
      seq += 1;
      const startMatch = act.startTime?.match(HHMM);

      lines.push('BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${stamp}`);

      if (startMatch) {
        const start = new Date(day.date);
        start.setHours(Number(startMatch[1]), Number(startMatch[2]), 0, 0);
        const endMatch = act.endTime?.match(HHMM);
        let end;
        if (endMatch) {
          end = new Date(day.date);
          end.setHours(Number(endMatch[1]), Number(endMatch[2]), 0, 0);
        }
        if (!end || end <= start) end = new Date(start.getTime() + 60 * 60 * 1000);
        lines.push(`DTSTART:${icsDateTime(start)}`, `DTEND:${icsDateTime(end)}`);
      } else {
        // All-day event (DTEND is exclusive → next day).
        const start = new Date(day.date);
        const next = new Date(day.date);
        next.setDate(next.getDate() + 1);
        lines.push(`DTSTART;VALUE=DATE:${icsDate(start)}`, `DTEND;VALUE=DATE:${icsDate(next)}`);
      }

      lines.push(`SUMMARY:${escapeIcs(act.title)}`);
      if (act.location?.name) lines.push(`LOCATION:${escapeIcs(act.location.name)}`);
      if (act.description) lines.push(`DESCRIPTION:${escapeIcs(act.description)}`);
      lines.push('END:VEVENT');
    }
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/** Trigger a download of the trip's itinerary as an .ics file. */
export function downloadIcs(trip) {
  const blob = new Blob([buildIcs(trip)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(trip.title || 'trip').replace(/[^\w-]+/g, '_').slice(0, 60)}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
