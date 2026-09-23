import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { LayoutList, Kanban as KanbanIcon, Calendar as CalendarIcon, ArrowUpDown, Plus } from 'lucide-react';
import { sortTasks, cn, computeTaskStats } from '../utils/helpers.js';
import { formatDate, isOverdue, getCalendarDays, isSameMonth, isSameDay } from '../utils/dateUtils.js';
import { STATUS_COLORS, PRIORITY_COLORS, PRIORITY_LIST, STATUS_LIST, KANBAN_COLUMNS } from '../utils/constants.js';

export default function MyTasks() {
  const { currentUser, filteredTasks, projects, setSelectedTaskId, openAddTask } = useApp();
  const [view, setView] = useState('list');
  const [sortBy, setSortBy] = useState('dueDate');

  if (!currentUser) return <div className="p-6">Please select a user in Settings.</div>;

  const myTasks = filteredTasks.filter(t => t.assignee_id === currentUser.id);
  const sortedTasks = sortTasks(myTasks, sortBy);

  const renderListView = () => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 font-medium">
            <th className="p-4 w-12">Pri</th>
            <th className="p-4 w-32">Jira</th>
            <th className="p-4">Title</th>
            <th className="p-4 w-32">Status</th>
            <th className="p-4 w-32">Due Date</th>
            <th className="p-4 w-32">Progress</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {sortedTasks.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-gray-500">No tasks assigned to you.</td>
            </tr>
          ) : (
            sortedTasks.map(task => {
              const overdue = isOverdue(task.due_date, task.status);
              return (
                <tr 
                  key={task.id} 
                  onClick={() => setSelectedTaskId(task.id)}
                  className={cn(
                    "border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors",
                    overdue && "bg-red-50 border-l-4 border-l-red-400"
                  )}
                >
                  <td className="p-4">
                    <div className={cn("w-3 h-3 rounded-full", PRIORITY_COLORS[task.priority]?.bg)} />
                  </td>
                  <td className="p-4 text-blue-600 hover:underline">{task.jira_ticket || '-'}</td>
                  <td className="p-4 font-medium text-gray-900">{task.title}</td>
                  <td className="p-4">
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", STATUS_COLORS[task.status]?.bg, STATUS_COLORS[task.status]?.text)}>
                      {STATUS_COLORS[task.status]?.label || task.status}
                    </span>
                  </td>
                  <td className={cn("p-4", overdue ? "text-red-600 font-medium" : "text-gray-600")}>
                    {formatDate(task.due_date)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${task.progress || 0}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{task.progress || 0}%</span>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  const renderKanbanView = () => {
    return (
      <div className="flex gap-6 overflow-x-auto pb-4 h-full">
        {KANBAN_COLUMNS.map(col => {
          const colTasks = sortedTasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="flex-shrink-0 w-80 bg-gray-50 rounded-xl p-4 flex flex-col gap-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="font-semibold text-gray-700">{col.title}</h3>
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">{colTasks.length}</span>
              </div>
              <div className="flex flex-col gap-3">
                {colTasks.map(task => (
                  <div key={task.id} onClick={() => setSelectedTaskId(task.id)} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-medium text-gray-500">{task.jira_ticket}</span>
                      <div className={cn("w-2 h-2 rounded-full", PRIORITY_COLORS[task.priority]?.bg)} />
                    </div>
                    <h4 className="font-medium text-sm text-gray-900 mb-2">{task.title}</h4>
                    <div className="text-xs text-gray-500">{formatDate(task.due_date)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCalendarView = () => {
    const today = new Date();
    const days = getCalendarDays(today);
    
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-[100px]">
          {days.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, today);
            const isToday = isSameDay(day, today);
            const dayTasks = sortedTasks.filter(t => t.due_date && isSameDay(new Date(t.due_date), day));
            
            return (
              <div key={i} className={cn("border-b border-r border-gray-100 p-2 overflow-y-auto", !isCurrentMonth && "bg-gray-50", isToday && "bg-blue-50 ring-inset ring-1 ring-blue-200")}>
                <div className={cn("text-xs font-medium mb-1", isToday ? "text-blue-600" : (isCurrentMonth ? "text-gray-900" : "text-gray-400"))}>
                  {day.getDate()}
                </div>
                <div className="flex flex-col gap-1">
                  {dayTasks.map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => setSelectedTaskId(task.id)}
                      className={cn(
                        "text-[10px] truncate px-1.5 py-0.5 rounded cursor-pointer",
                        STATUS_COLORS[task.status]?.bg || "bg-gray-100",
                        STATUS_COLORS[task.status]?.text || "text-gray-700"
                      )}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your assigned work.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button onClick={() => setView('list')} className={cn("p-1.5 rounded-md text-gray-600 hover:text-gray-900 transition-colors", view === 'list' && "bg-white shadow-sm text-blue-600")} title="List View"><LayoutList size={18} /></button>
            <button onClick={() => setView('kanban')} className={cn("p-1.5 rounded-md text-gray-600 hover:text-gray-900 transition-colors", view === 'kanban' && "bg-white shadow-sm text-blue-600")} title="Kanban View"><KanbanIcon size={18} /></button>
            <button onClick={() => setView('calendar')} className={cn("p-1.5 rounded-md text-gray-600 hover:text-gray-900 transition-colors", view === 'calendar' && "bg-white shadow-sm text-blue-600")} title="Calendar View"><CalendarIcon size={18} /></button>
          </div>
          {view !== 'kanban' && (
            <div className="relative flex items-center bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm shadow-sm">
              <ArrowUpDown size={14} className="text-gray-400 mr-2" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none outline-none text-gray-700 cursor-pointer"
              >
                <option value="priority">Sort by Priority</option>
                <option value="dueDate">Sort by Due Date</option>
                <option value="status">Sort by Status</option>
                <option value="recentlyUpdated">Recently Updated</option>
              </select>
            </div>
          )}
          <button onClick={openAddTask} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <Plus size={16} />
            Add Task
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        {view === 'list' && renderListView()}
        {view === 'kanban' && renderKanbanView()}
        {view === 'calendar' && renderCalendarView()}
      </div>
    </div>
  );
}
