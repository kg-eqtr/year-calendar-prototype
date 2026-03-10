const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

export interface MonthColumn {
  year: number;
  month: number;
  name: string;
  weeks: WeekColumn[];
}

export interface WeekColumn {
  weekStart: Date;
  label: string;
}

export function getMonthsInRange(
  startDate: Date,
  months: number
): MonthColumn[] {
  const result: MonthColumn[] = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  for (let i = 0; i < months; i++) {
    const year = current.getFullYear();
    const month = current.getMonth();
    const weeks = getWeeksInMonth(year, month);

    result.push({
      year,
      month,
      name: MONTH_NAMES[month],
      weeks,
    });

    current.setMonth(current.getMonth() + 1);
  }

  return result;
}

function getWeeksInMonth(year: number, month: number): WeekColumn[] {
  const weeks: WeekColumn[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let monday = new Date(firstDay);
  const dow = monday.getDay();
  if (dow !== 1) {
    const daysUntilMonday = dow === 0 ? 1 : (8 - dow);
    monday.setDate(monday.getDate() + daysUntilMonday);
  }

  while (monday <= lastDay) {
    weeks.push({
      weekStart: new Date(monday),
      label: String(monday.getDate()).padStart(2, "0"),
    });
    monday.setDate(monday.getDate() + 7);
  }

  return weeks;
}

export function getWeekDays(weekStart: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

export { WEEKDAY_LABELS, MONTH_NAMES };

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export function dateToStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isDateInRange(
  date: Date,
  startStr: string,
  endStr: string
): boolean {
  const dStr = dateToStr(date);
  return dStr >= startStr && dStr <= endStr;
}
