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

export class AvailabilityUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AvailabilityUnavailableError";
  }
}

/** Build the past/future skeleton for a month. Real Hospitable data is
 *  layered on top — anything not returned from the API stays "available". */
function buildMonthSkeleton(year: number, month: number): CalendarDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const out: CalendarDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    out.push({ date: dateKey, status: date < today ? "past" : "available" });
  }
  return out;
}

/**
 * Returns availability for a given month from Hospitable.
 * Hospitable is the central hub syncing Airbnb, VRBO, and direct bookings.
 *
 * No mock fallback. If Hospitable is unreachable the function throws an
 * AvailabilityUnavailableError so the UI can surface a "live availability
 * unavailable" notice instead of showing fabricated dates.
 */
export async function getAvailability(
  year: number,
  month: number
): Promise<CalendarDay[]> {
  if (!PROPERTY_ID) {
    throw new AvailabilityUnavailableError("Hospitable property ID not configured");
  }

  const lastDay = new Date(year, month + 1, 0).getDate();
  const fromDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const toDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  let res: Response;
  try {
    res = await fetch(
      `${FUNCTIONS_URL}/getAvailability?propertyId=${PROPERTY_ID}&from=${fromDate}&to=${toDate}`,
      { cache: "no-store" }
    );
  } catch {
    throw new AvailabilityUnavailableError("Network error contacting availability service");
  }
  if (!res.ok) {
    throw new AvailabilityUnavailableError(`Availability service returned ${res.status}`);
  }

  const data = (await res.json()) as { days?: CalendarDay[] };
  const days = data.days ?? [];
  const skeleton = buildMonthSkeleton(year, month);
  const byDate = new Map(days.map((d) => [d.date, d]));
  return skeleton.map((s) => {
    if (s.status === "past") return s;
    return byDate.get(s.date) ?? s;
  });
}
