"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  AvailabilityUnavailableError,
  type CalendarDay,
  type DayStatus,
  getAvailability,
} from "@/lib/hospitable";

/** Format a Date as yyyy-mm-dd in local time (timezone-safe). */
function dateKeyFor(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const STATUS_COLORS: Record<DayStatus, string> = {
  available: "#22c55e",
  limited: "#f59e0b",
  booked: "#ef4444",
  past: "#9ca3af",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface AvailabilityCalendarProps {
  selectedDate?: Date | null;
  onSelectDate?: (date: Date) => void;
}

export default function AvailabilityCalendar({
  selectedDate,
  onSelectDate,
}: AvailabilityCalendarProps = {}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Bookings require at least 3 days lead time so we have time to prep the
  // property and confirm details. Dates inside this window render disabled.
  const MIN_LEAD_DAYS = 3;
  const minBookingDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + MIN_LEAD_DAYS);
    return d;
  }, [today]);

  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [availability, setAvailability] = useState<Record<string, CalendarDay>>({});
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const maxDate = new Date(today.getFullYear(), today.getMonth() + 18, 1);
  const canGoBack =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());
  const canGoForward = new Date(viewYear, viewMonth + 1, 1) < maxDate;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    getAvailability(viewYear, viewMonth)
      .then((days) => {
        if (cancelled) return;
        const map: Record<string, CalendarDay> = {};
        for (const d of days) map[d.date] = d;
        setAvailability(map);
      })
      .catch((err) => {
        if (cancelled) return;
        setAvailability({});
        if (err instanceof AvailabilityUnavailableError) {
          setLoadError("Live availability is temporarily unavailable. Please call or email to confirm dates.");
        } else {
          setLoadError("Could not load availability.");
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [viewYear, viewMonth]);

  const goBack = () => {
    if (!canGoBack) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goForward = () => {
    if (!canGoForward) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const selectedKey = selectedDate
    ? dateKeyFor(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    : null;

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const rows: (
      | null
      | {
          day: number;
          dateKey: string;
          status: DayStatus;
          isToday: boolean;
          isSelected: boolean;
        }
    )[][] = [];
    let currentRow: typeof rows[number] = [];

    for (let i = 0; i < firstDay; i++) currentRow.push(null);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const dateKey = dateKeyFor(viewYear, viewMonth, d);
      const data = availability[dateKey];
      // Treat anything earlier than the 3-day lead-time floor as "past" so the
      // calendar greys it out and selection is blocked.
      const status: DayStatus = data?.status ?? (date < minBookingDate ? "past" : "available");
      const isToday =
        d === today.getDate() &&
        viewMonth === today.getMonth() &&
        viewYear === today.getFullYear();
      const isSelected = selectedKey === dateKey;

      currentRow.push({ day: d, dateKey, status, isToday, isSelected });
      if (currentRow.length === 7) {
        rows.push(currentRow);
        currentRow = [];
      }
    }

    if (currentRow.length > 0) {
      while (currentRow.length < 7) currentRow.push(null);
      rows.push(currentRow);
    }
    return rows;
  }, [viewYear, viewMonth, today, minBookingDate, availability, selectedKey]);

  const handleSelect = (dateKey: string, status: DayStatus) => {
    if (!onSelectDate) return;
    if (status === "past" || status === "booked") return;
    const picked = new Date(dateKey + "T00:00:00");
    if (picked < minBookingDate) return; // enforce 3-day lead time
    onSelectDate(picked);
  };

  return (
    <div className="border border-border bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <button
          type="button"
          onClick={goBack}
          disabled={!canGoBack}
          className="p-1.5 text-muted hover:text-dark disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="font-heading text-xl text-dark tracking-wide">
          {MONTH_NAMES[viewMonth]} {viewYear}
          {loading && <span className="text-xs text-muted ml-2 font-sans">Loading…</span>}
        </h3>
        <button
          type="button"
          onClick={goForward}
          disabled={!canGoForward}
          className="p-1.5 text-muted hover:text-dark disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 border-b border-border">
        {DAY_LABELS.map((label) => (
          <div key={label} className="py-3 text-center text-[10px] tracking-[0.2em] uppercase text-muted">
            {label}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div>
        {calendarDays.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-7">
            {row.map((cell, colIdx) => {
              if (!cell) return <div key={colIdx} className="aspect-square" />;
              const { day, dateKey, status, isToday, isSelected } = cell;
              const isPast = status === "past";
              const isBooked = status === "booked";
              const selectable = !isPast && !isBooked && !!onSelectDate;
              return (
                <button
                  key={colIdx}
                  type="button"
                  onClick={() => handleSelect(dateKey, status)}
                  disabled={!selectable}
                  aria-label={`${day} ${MONTH_NAMES[viewMonth]} — ${status}`}
                  className={`
                    relative aspect-square flex flex-col items-center justify-center
                    border-t border-r border-border
                    ${colIdx === 0 ? "border-l-0" : ""}
                    ${selectable ? "cursor-pointer hover:bg-cream/50" : "cursor-default"}
                    ${isSelected ? "bg-accent/20 ring-2 ring-accent ring-inset" : ""}
                    transition-colors duration-200
                  `}
                >
                  <span
                    className={`
                      text-sm leading-none
                      ${isToday ? "w-7 h-7 flex items-center justify-center rounded-full ring-2 ring-dark/80" : ""}
                      ${isPast ? "text-muted/40" : isBooked ? "text-muted/50 line-through" : isSelected ? "text-dark font-medium" : "text-dark"}
                    `}
                  >
                    {day}
                  </span>
                  {!isPast && (
                    <span
                      className="block w-1.5 h-1.5 rounded-full mt-1"
                      style={{ backgroundColor: STATUS_COLORS[status] }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 py-4 border-t border-border">
        {(["available", "limited", "booked"] as DayStatus[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[s] }} />
            <span className="text-[10px] tracking-[0.15em] uppercase text-muted">{s}</span>
          </div>
        ))}
      </div>

      {loadError && (
        <p className="text-[10px] text-amber-700 text-center py-2 italic border-t border-border">
          {loadError}
        </p>
      )}
    </div>
  );
}
