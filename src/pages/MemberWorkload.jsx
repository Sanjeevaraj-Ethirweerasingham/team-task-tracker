import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { ArrowLeft } from 'lucide-react';
import { computeTaskStats, getInitials, cn, getColorIndex } from '../utils/helpers.js';
import { AVATAR_COLORS, STATUS_COLORS, PRIORITY_COLORS } from '../utils/constants.js';
import { formatDate, isOverdue } from '../utils/dateUtils.js';

export default function MemberWorkload() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { users, allTasks, setSelectedTaskId } = useApp();

  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return (
      <div className="p-6">
        <button onClick={() => navigate('/team')} className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4"><ArrowLeft size={16} className="mr-1"/> Back to Team</button>
        <div>User not found.</div>
      </div>
    );
  }

  const userTasks = allTasks.filter(t => t.assignee_id === user.id);
  const stats = computeTaskStats(userTasks);
  const colorClass = AVATAR_COLORS[getColorIndex(user.id)];

  return (
    <div className="p-6 h-full flex flex-col">
      <button onClick={() => navigate('/team')} className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 w-fit"><ArrowLeft size={16} className="mr-1"/> Back to Team</button>
      
      <div className="flex items-center gap-6 mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className={cn("w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shrink-0", colorClass.bg, colorClass.text)}>
          {getInitials(user.name)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-500 mt-1">{user.role} • {user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl shadow-sm">
          <p className="text-sm text-amber-700 mb-1">Pending</p>
          <p className="text-2xl font-semibold text-amber-700">{stats.pending || 0}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl shadow-sm">
          <p className="text-sm text-blue-700 mb-1">In Progress</p>
          <p className="text-2xl font-semibold text-blue-700">{stats.inProgress || 0}</p>
        </div>
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl shadow-sm">
          <p className="text-sm text-red-700 mb-1">Blocked</p>
          <p className="text-2xl font-semibold text-red-700">{stats.blocked || 0}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl shadow-sm">
          <p className="text-sm text-emerald-700 mb-1">Completed</p>
          <p className="text-2xl font-semibold text-emerald-700">{stats.completed || 0}</p>
        </div>
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl shadow-sm">
          <p className="text-sm text-red-700 mb-1">Overdue</p>
          <p className="text-2xl font-semibold text-red-700">{stats.overdue}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">Assigned Tasks</h2>
      <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
              <tr className="border-b border-gray-200 text-sm text-gray-500 font-medium">
                <th className="p-4 w-12">Pri</th>
                <th className="p-4 w-32">Jira</th>
                <th className="p-4">Title</th>
                <th className="p-4 w-32">Status</th>
                <th className="p-4 w-32">Due Date</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {userTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No tasks assigned to this user.</td>
                </tr>
              ) : (
                userTasks.map(task => {
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
