// ── Status ──────────────────────────────────────────────
export const STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  BLOCKED: 'Blocked',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
};

export const STATUS_LIST = [
  STATUS.PENDING,
  STATUS.IN_PROGRESS,
  STATUS.BLOCKED,
  STATUS.ON_HOLD,
  STATUS.COMPLETED,
];

export const KANBAN_COLUMNS = [
  STATUS.PENDING,
  STATUS.IN_PROGRESS,
  STATUS.BLOCKED,
  STATUS.ON_HOLD,
  STATUS.COMPLETED,
];

// ── Priority ────────────────────────────────────────────
export const PRIORITY = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export const PRIORITY_LIST = [
  PRIORITY.CRITICAL,
  PRIORITY.HIGH,
  PRIORITY.MEDIUM,
  PRIORITY.LOW,
];

// ── Color Mappings ──────────────────────────────────────
export const STATUS_COLORS = {
  [STATUS.PENDING]: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-400',
    hex: '#f59e0b',
    headerBg: 'bg-amber-100',
  },
  [STATUS.IN_PROGRESS]: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    hex: '#3b82f6',
    headerBg: 'bg-blue-100',
  },
  [STATUS.BLOCKED]: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    hex: '#ef4444',
    headerBg: 'bg-red-100',
  },
  [STATUS.ON_HOLD]: {
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    hex: '#64748b',
    headerBg: 'bg-slate-100',
  },
  [STATUS.COMPLETED]: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    hex: '#10b981',
    headerBg: 'bg-emerald-100',
  },
};

export const PRIORITY_COLORS = {
  [PRIORITY.CRITICAL]: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-300',
    dot: 'bg-red-500',
    hex: '#ef4444',
  },
  [PRIORITY.HIGH]: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-300',
    dot: 'bg-orange-500',
    hex: '#f97316',
  },
  [PRIORITY.MEDIUM]: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-300',
    dot: 'bg-yellow-500',
    hex: '#eab308',
  },
  [PRIORITY.LOW]: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-300',
    dot: 'bg-green-500',
    hex: '#22c55e',
  },
};

// ── Activity Types ──────────────────────────────────────
export const ACTIVITY_TYPES = {
  CREATED: 'created',
  STATUS_CHANGED: 'status_changed',
  PRIORITY_CHANGED: 'priority_changed',
  ASSIGNEE_CHANGED: 'assignee_changed',
  PROGRESS_UPDATED: 'progress_updated',
  COMMENT_ADDED: 'comment_added',
  DUE_DATE_CHANGED: 'due_date_changed',
  DESCRIPTION_UPDATED: 'description_updated',
};

// ── Defaults ────────────────────────────────────────────
export const DEFAULT_JIRA_BASE_URL = 'https://jira.example.com';

export const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-pink-500',
];
