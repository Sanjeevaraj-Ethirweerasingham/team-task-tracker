import Papa from 'papaparse';
import { supabase } from '../db/supabase.js';
import { STATUS, PRIORITY } from './constants.js';
import { format } from 'date-fns';

/**
 * Export tasks to CSV and trigger download.
 */
export function exportTasksToCSV(tasks, users, projects) {
  const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));
  const projMap = Object.fromEntries(projects.map((p) => [p.id, p.name]));

  const rows = tasks.map((t) => ({
    'Jira Ticket': t.jira_ticket || '',
    'Task Title': t.title || '',
    'Description': t.description || '',
    'Status': t.status || '',
    'Priority': t.priority || '',
    'Assignee': userMap[t.assignee_id] || '',
    'Assigned By': userMap[t.assigned_by_id] || '',
    'Project': projMap[t.project_id] || '',
    'Due Date': t.due_date || '',
    'Start Date': t.start_date || '',
    'Progress': t.progress ?? 0,
    'Notes': t.notes || '',
  }));

  const csv = Papa.unparse(rows, { quotes: true });

  // Trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `tasks-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import tasks from a CSV file.
 * Returns { imported: number, skipped: number, errors: string[] }
 */
export function importTasksFromCSV(file, users, projects, currentUserId) {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const userMap = {};
        users.forEach((u) => {
          userMap[u.name.toLowerCase()] = u.id;
          if (u.email) userMap[u.email.toLowerCase()] = u.id;
        });
        const projMap = {};
        projects.forEach((p) => {
          projMap[p.name.toLowerCase()] = p.id;
        });

        const validTasks = [];
        const errors = [];
        let skipped = 0;

        for (let i = 0; i < results.data.length; i++) {
          const row = results.data[i];
          const rowNum = i + 2; // 1-indexed + header

          // Normalize header keys
          const title =
            row['Task Title'] || row['Title'] || row['title'] || row['task_title'] || '';
          if (!title.trim()) {
            errors.push(`Row ${rowNum}: Missing task title`);
            skipped++;
            continue;
          }

          // Map status
          let status = row['Status'] || row['status'] || 'Pending';
          if (!Object.values(STATUS).includes(status)) {
            status = 'Pending';
          }

          // Map priority
          let priority = row['Priority'] || row['priority'] || 'Medium';
          if (!Object.values(PRIORITY).includes(priority)) {
            priority = 'Medium';
          }

          // Map assignee
          const assigneeName = (row['Assignee'] || row['assignee'] || '').toLowerCase();
          const assigneeId = userMap[assigneeName] || null;

          // Map assigned by
          const assignedByName = (row['Assigned By'] || row['assigned_by'] || '').toLowerCase();
          const assignedById = userMap[assignedByName] || currentUserId || null;

          // Map project
          const projectName = (row['Project'] || row['project'] || '').toLowerCase();
          const projectId = projMap[projectName] || null;

          const now = new Date().toISOString();
          validTasks.push({
            title: title.trim(),
            description: row['Description'] || row['description'] || '',
            jira_ticket: row['Jira Ticket'] || row['jira_ticket'] || '',
            project_id: projectId,
            status,
            priority,
            assignee_id: assigneeId,
            assigned_by_id: assignedById,
            start_date: row['Start Date'] || row['start_date'] || null,
            due_date: row['Due Date'] || row['due_date'] || null,
            completed_date: status === 'Completed' ? now : null,
            progress: status === 'Completed' ? 100 : (row['Progress'] || 0),
            notes: row['Notes'] || row['notes'] || '',
          });
        }

        if (validTasks.length > 0) {
          const { error } = await supabase.from('tasks').insert(validTasks);
          if (error) {
            console.error('Import error:', error);
            errors.push(`Database insertion failed: ${error.message}`);
          }
        }

        resolve({
          imported: validTasks.length,
          skipped,
          errors,
        });
      },
    });
  });
}
