import i18n from "../i18n";

/**
 * Try to parse a timestamp string into a Date.
 * - If the string contains timezone info (Z or +hh:mm) or 'T', we try direct parsing.
 * - Otherwise we try replacing the space with 'T' and (optionally) append 'Z' to treat it as UTC.
 *
 * @param ts timestamp string like "2026-05-17 16:26:56.32304"
 * @param assumeUTC when true, treat timestamps without timezone as UTC (append 'Z'). Set false if server sends local times.
 */
export function parseTimestamp(ts: string, assumeUTC = true): Date | null {
  if (!ts) return null;

  // If it already looks like ISO with timezone or includes 'T', try direct parse first
  const looksLikeIsoOrHasTZ = /[Tt]/.test(ts) || /[Zz]|[+-]\d{2}:\d{2}$/.test(ts);  if (looksLikeIsoOrHasTZ) {
    const d = new Date(ts);
    if (!isNaN(d.getTime())) return d;
  }

  // Try to convert "YYYY-MM-DD HH:mm:ss..." -> "YYYY-MM-DDTHH:mm:ss..."
  let iso = ts.replace(' ', 'T');

  // If there is fraction with comma or extra whitespace, clean common issues:
  iso = iso.trim();

  // If no timezone info and assumeUTC true, append 'Z' to indicate UTC
  if (assumeUTC && !/[Zz]|[+-]\d{2}:\d{2}$/.test(iso)) {
    iso = iso + 'Z';
  }

  const d2 = new Date(iso);
  return isNaN(d2.getTime()) ? null : d2;
}

/** Format a timestamp into a local date+time string using the device locale. */
export function toLocalDateTimeString(ts: string, opts?: Intl.DateTimeFormatOptions, assumeUTC = true): string {
  const d = parseTimestamp(ts, assumeUTC);
  if (!d) return ts;
  const defaultOpts: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Intl.DateTimeFormat(i18n.language, {...defaultOpts, ...opts}).format(d);
}

/**
 * Return a human friendly relative time (using Intl.RelativeTimeFormat)
 * Falls back to full local date if older than `maxDays`.
 */
export function toRelativeTime(ts: string, maxDays = 7, assumeUTC = true): string {
  const d = parseTimestamp(ts, assumeUTC);
  if (!d) return ts;

  const now = Date.now();
  const diffMs = d.getTime() - now; // positive => in the future
  const rtf = new Intl.RelativeTimeFormat(i18n.language, { numeric: 'auto' });
  const sec = Math.round(diffMs / 1000);
  const min = Math.round(diffMs / 60_000);
  const hour = Math.round(diffMs / 3_600_000);
  const day = Math.round(diffMs / 86_400_000);

  if (Math.abs(day) >= maxDays) {
    return toLocalDateTimeString(ts, undefined, assumeUTC);
  }
  if (Math.abs(hour) >= 24) return rtf.format(day, 'day');
  if (Math.abs(min) >= 60) return rtf.format(hour, 'hour');
  if (Math.abs(sec) >= 60) return rtf.format(min, 'minute');
  return rtf.format(sec, 'second');
}