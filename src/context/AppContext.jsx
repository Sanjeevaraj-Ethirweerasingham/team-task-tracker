import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { supabase } from '../db/supabase.js';
import { useAuth } from './AuthContext.jsx';

const AppContext = createContext(null);

const INITIAL_FILTERS = {
  status: '',
  assignee: '',
  assignedBy: '',
  priority: '',
  project: '',
  search: '',
  tags: [],
  dateRange: { from: '', to: '' },
};

export function AppProvider({ children }) {
  const { user } = useAuth();

  // ── UI state ──────────────────────────────────────────
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filters, setFiltersState] = useState(INITIAL_FILTERS);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // ── Data state ────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [tags, setTags] = useState([]);
  const [dbReady, setDbReady] = useState(false);

  // ── Current user (from users table, matched by auth id) ──
  const currentUser = useMemo(() => {
    if (!user) return null;
    return users.find((u) => u.id === user.id) || null;
  }, [user, users]);

  const currentUserId = currentUser?.id || user?.id || null;

  // ── Fetch all data from Supabase ──────────────────────
  const refreshData = useCallback(async () => {
    try {
      const [usersRes, tasksRes, projectsRes, tagsRes] = await Promise.all([
        supabase.from('users').select('*').eq('active', true).order('name'),
        supabase
          .from('tasks')
          .select('*')
          .order('updated_at', { ascending: false }),
        supabase.from('projects').select('*').order('name'),
        supabase.from('tags').select('*').order('name'),
      ]);

      setUsers(usersRes.data || []);
      setAllTasks(tasksRes.data || []);
      setProjects(projectsRes.data || []);
      setTags(tagsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setDbReady(true);
    }
  }, []);

  // Fetch on mount / when auth user changes
  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  // ── Real-time subscriptions (auto-refresh on DB changes) ──
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('data-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => refreshData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => refreshData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => refreshData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_comments' },
        () => refreshData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshData]);

  // ── Filters ───────────────────────────────────────────
  const setFilters = useCallback((update) => {
    setFiltersState((prev) =>
      typeof update === 'function' ? update(prev) : { ...prev, ...update }
    );
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(INITIAL_FILTERS);
  }, []);

  const hasActiveFilters = useMemo(
    () =>
      filters.status !== '' ||
      filters.assignee !== '' ||
      filters.assignedBy !== '' ||
      filters.priority !== '' ||
      filters.project !== '' ||
      filters.search !== '' ||
      filters.tags.length > 0 ||
      filters.dateRange.from !== '' ||
      filters.dateRange.to !== '',
    [filters]
  );

  // ── Filtered tasks ────────────────────────────────────
  const filteredTasks = useMemo(() => {
    let tasks = [...allTasks];

    if (filters.status) {
      tasks = tasks.filter((t) => t.status === filters.status);
    }
    if (filters.priority) {
      tasks = tasks.filter((t) => t.priority === filters.priority);
    }
    if (filters.assignee) {
      tasks = tasks.filter((t) => t.assignee_id === filters.assignee);
    }
    if (filters.assignedBy) {
      tasks = tasks.filter((t) => t.assigned_by_id === filters.assignedBy);
    }
    if (filters.project) {
      tasks = tasks.filter((t) => t.project_id === filters.project);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.jira_ticket?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    return tasks;
  }, [allTasks, filters]);

  // ── Task form helpers ─────────────────────────────────
  const openAddTask = useCallback(() => {
    setEditingTask(null);
    setShowTaskForm(true);
  }, []);

  const openEditTask = useCallback((task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  }, []);

  const closeTaskForm = useCallback(() => {
    setShowTaskForm(false);
    setEditingTask(null);
  }, []);

  // ── Sidebar ───────────────────────────────────────────
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  // ── Context value ─────────────────────────────────────
  const value = useMemo(
    () => ({
      dbReady,
      sidebarCollapsed,
      toggleSidebar,
      currentUser,
      currentUserId,
      filters,
      hasActiveFilters,
      setFilters,
      clearFilters,
      selectedTaskId,
      setSelectedTaskId,
      showTaskForm,
      editingTask,
      openAddTask,
      openEditTask,
      closeTaskForm,
      users,
      projects,
      allTasks,
      filteredTasks,
      tags,
      refreshData,
    }),
    [
      dbReady,
      sidebarCollapsed,
      toggleSidebar,
      currentUser,
      currentUserId,
      filters,
      hasActiveFilters,
      setFilters,
      clearFilters,
      selectedTaskId,
      showTaskForm,
      editingTask,
      openAddTask,
      openEditTask,
      closeTaskForm,
      users,
      projects,
      allTasks,
      filteredTasks,
      tags,
      refreshData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
