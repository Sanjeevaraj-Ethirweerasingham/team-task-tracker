import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { exportTasksToCSV, importTasksFromCSV } from '../utils/csvUtils';
import { sortTasks } from '../utils/helpers';
import { FilterBar } from '../components/common/FilterBar';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { ProgressBar } from '../components/common/ProgressBar';
import { 
  ArrowUpDown, ArrowUp, ArrowDown, Download, Upload, Plus, Pencil, Trash2, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { formatShortDate, isOverdue } from '../utils/dateUtils';
import { deleteTask } from '../db/taskService';

export default function AllTasks() {
  const { 
    filteredTasks, users, projects, allTasks, currentUserId, 
    setSelectedTaskId, openAddTask, openEditTask 
  } = useApp();
  
  const [sortState, setSortState] = useState({ field: 'updated_at', direction: 'desc' });
  const fileInputRef = useRef(null);

  const handleSort = (field) => {
    setSortState(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedTasks = sortTasks(filteredTasks, sortState.field, sortState.direction);

  const SortIcon = ({ field }) => {
    if (sortState.field !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
    return sortState.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-primary-600" /> : <ArrowDown className="w-3.5 h-3.5 text-primary-600" />;
  };

  const handleExport = () => {
    exportTasksToCSV(filteredTasks, users, projects);
    toast.success('Exported tasks to CSV');
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await importTasksFromCSV(file, currentUserId, users, projects);
      toast.success(`Imported ${result.success} tasks successfully`);
      if (result.errors.length > 0) {
        toast.error(`Failed to import ${result.errors.length} tasks`);
      }
    } catch (err) {
      toast.error(err.message || 'Error importing CSV');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        toast.success('Task deleted');
      } catch (err) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleEdit = (e, task) => {
    e.stopPropagation();
    openEditTask(task);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <FilterBar />
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImport} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button 
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button 
            onClick={openAddTask}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th scope="col" className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('jira_ticket')}>
                  <div className="flex items-center gap-1">Ticket <SortIcon field="jira_ticket" /></div>
                </th>
                <th scope="col" className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-1">Title <SortIcon field="title" /></div>
                </th>
                <th scope="col" className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">Status <SortIcon field="status" /></div>
                </th>
                <th scope="col" className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('priority')}>
                  <div className="flex items-center gap-1">Priority <SortIcon field="priority" /></div>
                </th>
                <th scope="col" className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('assignee_id')}>
                  <div className="flex items-center gap-1">Assignee <SortIcon field="assignee_id" /></div>
                </th>
                <th scope="col" className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('due_date')}>
                  <div className="flex items-center gap-1">Due Date <SortIcon field="due_date" /></div>
                </th>
                <th scope="col" className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100" onClick={() => handleSort('progress')}>
                  <div className="flex items-center gap-1">Progress <SortIcon field="progress" /></div>
                </th>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTasks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No tasks found matching your filters.
                  </td>
                </tr>
              ) : (
                sortedTasks.map(task => {
                  const assignee = users?.find(u => u.id === task.assignee_id);
                  const isTaskOverdue = isOverdue(task.due_date) && task.status !== 'Completed';

                  return (
                    <tr 
                      key={task.id} 
                      onClick={() => setSelectedTaskId(task.id)}
                      className="hover:bg-gray-50 cursor-pointer group transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-600">
                        {task.jira_ticket || '-'}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate" title={task.title}>
                        {task.title}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {assignee ? <Avatar user={assignee} size="sm" /> : <span className="text-gray-400 text-xs">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {task.due_date ? (
                          <div className={`flex items-center gap-1.5 ${isTaskOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatShortDate(task.due_date)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 w-32">
                        <ProgressBar progress={task.progress} showValue />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => handleEdit(e, task)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit Task"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => handleDelete(e, task.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete Task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
