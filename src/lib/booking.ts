export type DurationBlock = 4 | 8 | 12 | 24;

export interface BlockOption {
  hours: DurationBlock;
  price: number;
  label: string;
  desc: string;
}

export const BLOCK_OPTIONS: BlockOption[] = [
  { hours: 4, price: 1500, label: "4 Hours", desc: "Half-day event" },
  { hours: 8, price: 2500, label: "8 Hours", desc: "Full-day event" },
  { hours: 12, price: 3500, label: "12 Hours", desc: "Extended day" },
  { hours: 24, price: 4500, label: "24 Hours", desc: "Overnight stay" },
];

export const EVENT_TYPES = [
  "Wedding",
  "Elopement",
  "Birthday",
  "Family Gathering",
  "Corporate Retreat",
  "Private Dinner",
  "Wellness Retreat",
  "Photography",
  "Other",
];

/** Format HH:MM (24h) → "9:30 AM". */
export function formatTime(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${String(m).padStart(2, "0")} ${period}`;
}

/** Add hours to HH:MM, returning HH:MM. Wraps past 24:00 into next day. */
export function addHours(hhmm: string, hours: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + hours * 60;
  const wrappedMinutes = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const hh = Math.floor(wrappedMinutes / 60);
  const mm = wrappedMinutes % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/** Returns whole hours between two HH:MM times (end may be next-day). */
export function durationBetween(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let diff = eh * 60 + em - (sh * 60 + sm);
  if (diff <= 0) diff += 24 * 60;
  return diff / 60;
}
