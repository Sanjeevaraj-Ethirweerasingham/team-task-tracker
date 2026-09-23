import {
  format,
  formatDistanceToNow,
  isBefore,
  isToday as isTodayFn,
  isThisWeek as isThisWeekFn,
  differenceInDays,
  parseISO,
  startOfDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
} from 'date-fns';

/** Format a date string to "Sep 21, 2026" */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(date, 'MMM dd, yyyy');
}

/** Format a date string to "Sep 21" */
export function formatShortDate(dateStr) {
  if (!dateStr) return '—';
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(date, 'MMM dd');
}

/** Format relative time: "2 days ago", "in 3 hours" */
export function formatRelative(dateStr) {
  if (!dateStr) return '—';
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return formatDistanceToNow(date, { addSuffix: true });
}

/** Check if a task is overdue (due date is before today and not completed) */
export function isOverdue(dueDate, status) {
  if (!dueDate || status === 'Completed') return false;
  const due = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  return isBefore(startOfDay(due), startOfDay(new Date()));
}

/** Get number of days overdue */
export function daysOverdue(dueDate) {
  if (!dueDate) return 0;
  const due = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  const diff = differenceInDays(startOfDay(new Date()), startOfDay(due));
  return diff > 0 ? diff : 0;
}

/** Check if due today */
export function isDueToday(dueDate) {
  if (!dueDate) return false;
  const due = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  return isTodayFn(due);
}

/** Check if due this week */
export function isDueThisWeek(dueDate) {
  if (!dueDate) return false;
  const due = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  return isThisWeekFn(due, { weekStartsOn: 1 });
}

/** Format for HTML date inputs (yyyy-MM-dd) */
export function formatDateForInput(dateStr) {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(date, 'yyyy-MM-dd');
}

/** Days until due (negative = overdue) */
export function getDaysUntilDue(dueDate) {
  if (!dueDate) return null;
  const due = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  return differenceInDays(startOfDay(due), startOfDay(new Date()));
}

/** Get a human-friendly due date label */
export function getDueDateLabel(dueDate, status) {
  if (!dueDate) return null;
  if (status === 'Completed') return null;
  const days = getDaysUntilDue(dueDate);
  if (days === null) return null;
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days <= 7) return `Due in ${days}d`;
  return null;
}

/** Get calendar days for a month view (includes padding from adjacent months) */
export function getCalendarDays(date) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: calStart, end: calEnd });
}

// Re-export commonly needed functions
export {
  parseISO,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  format,
  startOfDay,
};
