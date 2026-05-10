import { FEATURES } from "./featureFlags";

export type DayStatus = "available" | "limited" | "booked" | "past";

export interface CalendarDay {
  date: string; // ISO yyyy-mm-dd
  status: DayStatus;
  price?: number;
  minNights?: number;
}

const FUNCTIONS_URL =
  process.env.NEXT_PUBLIC_FUNCTIONS_URL ||
  "https://us-central1-bakkers-website-847ba.cloudfunctions.net";

const PROPERTY_ID = process.env.NEXT_PUBLIC_HOSPITABLE_PROPERTY_ID || "";

/** Deterministic pseudo-random for mock availability. */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs((Math.sin(hash) * 10000) % 1);
}

function mockStatus(date: Date): DayStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return "past";

  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const seed = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const rand = seededRandom(seed);

  if (isWeekend) {
    if (rand < 0.35) return "booked";
    if (rand < 0.75) return "limited";
    return "available";
  }
  if (rand < 0.08) return "booked";
  if (rand < 0.22) return "limited";
  return "available";
}

function generateMockMonth(year: number, month: number): CalendarDay[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const out: CalendarDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    out.push({
      date: dateKey,
      status: mockStatus(date),
    });
  }
  return out;
}

/**
 * Returns availability for a given month from Hospitable.
 * Hospitable is the central hub syncing Airbnb, VRBO, and direct bookings.
 *
 * Falls back to mock data when Hospitable is not yet configured
 * (FEATURES.HOSPITABLE_LIVE = false or no property ID).
 *
 * To enable: set HOSPITABLE_API_TOKEN in functions/.env, deploy the
 * getAvailability Cloud Function, set NEXT_PUBLIC_HOSPITABLE_PROPERTY_ID,
 * and flip FEATURES.HOSPITABLE_LIVE to true.
 */
export async function getAvailability(
  year: number,
  month: number
): Promise<CalendarDay[]> {
  if (!FEATURES.HOSPITABLE_LIVE || !PROPERTY_ID) {
    return generateMockMonth(year, month);
  }

  try {
    const lastDay = new Date(year, month + 1, 0).getDate();
    const fromDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const toDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    const res = await fetch(
      `${FUNCTIONS_URL}/getAvailability?propertyId=${PROPERTY_ID}&from=${fromDate}&to=${toDate}`
    );
    if (!res.ok) throw new Error(`Hospitable API ${res.status}`);
    const data = await res.json();
    return data.days as CalendarDay[];
  } catch (err) {
    console.error("Hospitable availability fetch failed, falling back to mock:", err);
    return generateMockMonth(year, month);
  }
}

export const isMockMode = () => !FEATURES.HOSPITABLE_LIVE || !PROPERTY_ID;
