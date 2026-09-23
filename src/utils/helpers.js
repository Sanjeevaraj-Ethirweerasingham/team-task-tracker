import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';

/** Merge Tailwind classes with conflict resolution */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Generate a UUID */
export function generateId() {
  return uuidv4();
}

/** Get initials from a name: "John Doe" → "JD" */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** Truncate text with ellipsis */
export function truncateText(text, maxLength = 60) {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength) + '…';
}

/** Search tasks by matching query against multiple fields */
export function searchTasks(tasks, query) {
  if (!query || !query.trim()) return tasks;
  const q = query.toLowerCase().trim();
  return tasks.filter(
    (t) =>
      t.title?.toLowerCase().includes(q) ||
      t.jira_ticket?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.notes?.toLowerCase().includes(q)
  );
}

/** Sort tasks with priority-aware ordering */
export function sortTasks(tasks, sortBy = 'updated_at', sortDir = 'desc') {
  const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };

  return [...tasks].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === 'priority') {
      valA = priorityOrder[valA] ?? 4;
      valB = priorityOrder[valB] ?? 4;
    }

    if (valA == null && valB == null) return 0;
    if (valA == null) return 1;
    if (valB == null) return -1;
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
}

/** Compute task statistics from a task array */
export function computeTaskStats(tasks) {
  const now = new Date();
  return {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'Pending').length,
    inProgress: tasks.filter((t) => t.status === 'In Progress').length,
    blocked: tasks.filter((t) => t.status === 'Blocked').length,
    onHold: tasks.filter((t) => t.status === 'On Hold').length,
    completed: tasks.filter((t) => t.status === 'Completed').length,
    overdue: tasks.filter(
      (t) =>
        t.due_date &&
        t.status !== 'Completed' &&
        new Date(t.due_date) < now
    ).length,
  };
}

/** Get a deterministic color index from a string (for avatars) */
export function getColorIndex(str) {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 8;
}
