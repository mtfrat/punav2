import type { SocialChannel, SocialDraftStatus } from "./social-studio.ts";

export const CONTENT_TIME_ZONE = "America/Argentina/Buenos_Aires";
export const CALENDAR_PAGE_SIZE = 25;
export const CALENDAR_COLLISION_MINUTES = 120;

export type CalendarView = "week" | "list";
export type CalendarRange = "upcoming" | "past" | "all";
export type CalendarStatus = Extract<SocialDraftStatus, "scheduled" | "published">;

const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;
const localDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

function dateParts(value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CONTENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function validDateKey(value: string) {
  if (!dateKeyPattern.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function todayCalendarKey(now = new Date()) {
  return dateParts(now);
}

export function addCalendarDays(value: string, days: number) {
  if (!validDateKey(value)) throw new Error("invalid_calendar_date");
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

export function calendarWeekStart(value?: string | null, now = new Date()) {
  const selected = value && validDateKey(value) ? value : todayCalendarKey(now);
  const [year, month, day] = selected.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return addCalendarDays(selected, -((weekday + 6) % 7));
}

export function calendarWeekDays(weekStart: string) {
  const monday = calendarWeekStart(weekStart);
  return Array.from({ length: 7 }, (_, index) => addCalendarDays(monday, index));
}

function partsInZone(value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CONTENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(byType.year), month: Number(byType.month), day: Number(byType.day),
    hour: Number(byType.hour), minute: Number(byType.minute), second: Number(byType.second),
  };
}

export function calendarLocalToUtc(value: string) {
  if (!localDateTimePattern.test(value)) throw new Error("invalid_calendar_datetime");
  const [date, time] = value.split("T");
  if (!validDateKey(date)) throw new Error("invalid_calendar_datetime");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  if (hour > 23 || minute > 59 || minute % 15 !== 0) throw new Error("invalid_calendar_datetime");
  const target = Date.UTC(year, month - 1, day, hour, minute, 0);
  let guess = target;
  for (let index = 0; index < 3; index += 1) {
    const actual = partsInZone(new Date(guess));
    const represented = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute, actual.second);
    guess += target - represented;
  }
  return new Date(guess);
}

export function calendarWeekRange(weekStart: string) {
  const monday = calendarWeekStart(weekStart);
  return {
    from: calendarLocalToUtc(`${monday}T00:00`).toISOString(),
    to: calendarLocalToUtc(`${addCalendarDays(monday, 7)}T00:00`).toISOString(),
  };
}

export function calendarDateTimeInput(value?: string | null) {
  if (!value) return "";
  const parts = partsInZone(new Date(value));
  const pad = (item: number) => String(item).padStart(2, "0");
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}

export function formatCalendarDay(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "UTC", weekday: "short", day: "numeric", month: "short",
  }).format(new Date(`${value}T12:00:00Z`));
}

export function formatCalendarTime(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: CONTENT_TIME_ZONE, hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(value));
}

export function formatCalendarDateTime(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: CONTENT_TIME_ZONE, dateStyle: "medium", timeStyle: "short", hour12: false,
  }).format(new Date(value));
}

export function isCalendarView(value: string): value is CalendarView {
  return value === "week" || value === "list";
}

export function isCalendarRange(value: string): value is CalendarRange {
  return value === "upcoming" || value === "past" || value === "all";
}

export function isCalendarStatus(value: string): value is CalendarStatus {
  return value === "scheduled" || value === "published";
}

export function isSafeCalendarReturnTo(value?: string | null) {
  return Boolean(value && (value === "/ops/calendar" || value.startsWith("/ops/calendar?")) && !value.includes("\\") && !value.includes("//"));
}

export function calendarCollisionMessage(count: number, channel: SocialChannel) {
  return `${count === 1 ? "Hay otra publicación" : `Hay ${count} publicaciones`} de ${channel === "linkedin" ? "LinkedIn" : channel === "instagram" ? "Instagram" : "X"} a menos de 2 horas.`;
}
