import { generateId } from "../utils/helpers.js";
import { supabase } from './supabase.js';

// ── Task CRUD ───────────────────────────────────────────

export async function createTask(taskData, currentUserId) {
  const task = {
    title: taskData.title || '',
    description: taskData.description || '',
    jira_ticket: taskData.jira_ticket || '',
    project_id: taskData.project_id || null,
    status: taskData.status || 'Pending',
    priority: taskData.priority || 'Medium',
    assignee_id: taskData.assignee_id || null,
    assigned_by_id: taskData.assigned_by_id || currentUserId || null,
    start_date: taskData.start_date || null,
    due_date: taskData.due_date || null,
    progress: taskData.progress || 0,
    notes: taskData.notes || '',
  };

  // Clean empty-string FKs to null (PostgreSQL requires null, not '')
  if (task.project_id === '') task.project_id = null;
  if (task.assignee_id === '') task.assignee_id = null;
  if (task.assigned_by_id === '') task.assigned_by_id = null;

  const { data, error } = await supabase.from('tasks').insert(task).select().single();
  if (error) throw error;

  await logActivity(data.id, currentUserId, 'created');
  return data;
}

export async function updateTask(taskId, changes, currentUserId) {
  // Get old task for activity logging
  const { data: oldTask } = await supabase
    .from('tasks')
    .select()
    .eq('id', taskId)
    .single();
  if (!oldTask) return null;

  const updates = { ...changes };

  // Auto-set completed_date when marking Completed
  if (changes.status === 'Completed' && oldTask.status !== 'Completed') {
    updates.completed_date = new Date().toISOString();
    if (updates.progress === undefined) updates.progress = 100;
  }
  // Clear completed_date if moved out of Completed
  if (changes.status && changes.status !== 'Completed' && oldTask.status === 'Completed') {
    updates.completed_date = null;
  }
  // Auto-set start_date when moved to In Progress
  if (changes.status === 'In Progress' && !oldTask.start_date) {
    updates.start_date = new Date().toISOString().split('T')[0];
  }

  // Clean empty-string FKs to null
  if (updates.project_id === '') updates.project_id = null;
  if (updates.assignee_id === '') updates.assignee_id = null;
  if (updates.assigned_by_id === '') updates.assigned_by_id = null;

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();
  if (error) throw error;

  // Log activity for key field changes
  const trackFields = {
    status: 'status_changed',
    priority: 'priority_changed',
    assignee_id: 'assignee_changed',
    progress: 'progress_updated',
    due_date: 'due_date_changed',
  };

  for (const [field, actType] of Object.entries(trackFields)) {
    if (
      changes[field] !== undefined &&
      String(changes[field] ?? '') !== String(oldTask[field] ?? '')
    ) {
      await logActivity(
        taskId,
        currentUserId,
        actType,
        String(oldTask[field] ?? ''),
        String(changes[field] ?? '')
      );
    }
  }

  return data;
}

export async function deleteTask(taskId) {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) throw error;
}

export async function bulkUpdateTaskStatus(taskIds, status, currentUserId) {
  for (const id of taskIds) {
    await updateTask(id, { status }, currentUserId);
  }
}

// ── Comments ────────────────────────────────────────────

export async function addComment(taskId, userId, comment) {
  const { data, error } = await supabase
    .from('task_comments')
    .insert({ task_id: taskId, user_id: userId, comment })
    .select()
    .single();
  if (error) throw error;

  await logActivity(taskId, userId, 'comment_added');
  return data;
}

// ── Activity Logging (internal) ─────────────────────────

async function logActivity(
  taskId,
  userId,
  activityType,
  oldValue = null,
  newValue = null
) {
  await supabase.from('task_activity').insert({
    task_id: taskId,
    user_id: userId,
    activity_type: activityType,
    old_value: oldValue,
    new_value: newValue,
  });
}

// ── Projects CRUD ───────────────────────────────────────

export async function createProject(data) {
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      name: data.name,
      description: data.description || '',
      status: 'active',
    })
    .select()
    .single();
  if (error) throw error;
  return project;
}

export async function updateProject(projectId, changes) {
  const { error } = await supabase
    .from('projects')
    .update(changes)
    .eq('id', projectId);
  if (error) throw error;
}

export async function deleteProject(projectId) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);
  if (error) throw error;
}

// ── Users CRUD ──────────────────────────────────────────


export async function createUser(data) {
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      id: generateId(),
      name: data.name,
      email: data.email || '',
      role: data.role || '',
      active: true,
    })
    .select()
    .single();
  if (error) throw error;
  return user;
}

export async function updateUser(userId, changes) {
  const { error } = await supabase
    .from('users')
    .update(changes)
    .eq('id', userId);
  if (error) throw error;
}

export async function deleteUser(userId) {
  // Soft delete — deactivate instead of removing
  const { error } = await supabase
    .from('users')
    .update({ active: false })
    .eq('id', userId);
  if (error) throw error;
}

// ── Settings ────────────────────────────────────────────

export async function getSetting(key) {
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();
  return data?.value ?? null;
}

export async function setSetting(key, value) {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value: String(value) });
  if (error) throw error;
}

// ── Tags ────────────────────────────────────────────────

export async function createTag(name) {
  const { data, error } = await supabase
    .from('tags')
    .insert({ name })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getTaskTags(taskId) {
  const { data: taskTags } = await supabase
    .from('task_tags')
    .select('tag_id')
    .eq('task_id', taskId);
  if (!taskTags || taskTags.length === 0) return [];

  const tagIds = taskTags.map((tt) => tt.tag_id);
  const { data: tags } = await supabase.from('tags').select().in('id', tagIds);
  return tags || [];
}

export async function setTaskTags(taskId, tagIds) {
  await supabase.from('task_tags').delete().eq('task_id', taskId);
  if (tagIds.length > 0) {
    const entries = tagIds.map((tagId) => ({ task_id: taskId, tag_id: tagId }));
    await supabase.from('task_tags').insert(entries);
  }
}
