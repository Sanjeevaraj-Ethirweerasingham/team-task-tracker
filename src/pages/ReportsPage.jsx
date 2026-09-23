import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, LineChart, Line } from 'recharts';
import { STATUS_COLORS, PRIORITY_COLORS, STATUS_LIST, PRIORITY_LIST } from '../utils/constants.js';
import { isOverdue, daysOverdue, formatDate } from '../utils/dateUtils.js';
import { cn } from '../utils/helpers.js';

export default function ReportsPage() {
  const { allTasks, users } = useApp();

  const statusData = useMemo(() => {
    const counts = allTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    return STATUS_LIST.map(s => ({ name: s.label, value: counts[s.id] || 0, color: s.colorHex }));
  }, [allTasks]);

  const workloadData = useMemo(() => {
    return users.map(u => ({
      name: u.name,
      tasks: allTasks.filter(t => t.assignee_id === u.id).length
    })).sort((a, b) => b.tasks - a.tasks);
  }, [allTasks, users]);

  const priorityData = useMemo(() => {
    const counts = allTasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});
    return PRIORITY_LIST.map(p => ({ name: p.label, value: counts[p.id] || 0, color: p.colorHex }));
  }, [allTasks]);

  const completionData = useMemo(() => {
    const completed = allTasks.filter(t => t.status === 'completed' && t.completed_date);
    const dateCounts = completed.reduce((acc, t) => {
      const dateStr = t.completed_date.split('T')[0];
      acc[dateStr] = (acc[dateStr] || 0) + 1;
      return acc;
    }, {});
    
    const sortedDates = Object.keys(dateCounts).sort();
    let cumulative = 0;
    return sortedDates.map(date => {
      cumulative += dateCounts[date];
      return { date, count: cumulative };
    });
  }, [allTasks]);

  const overdueTasks = useMemo(() => {
    return allTasks
      .filter(t => t.due_date && isOverdue(t.due_date, t.status))
      .map(t => ({ ...t, daysOver: daysOverdue(t.due_date) }))
      .sort((a, b) => b.daysOver - a.daysOver);
  }, [allTasks]);

  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto bg-gray-50/50">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">View project insights and team performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Status Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Workload</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                <RechartsTooltip />
                <Bar dataKey="tasks" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Priority</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Completion Trend</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="date" tick={{fontSize: 12}} />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Overdue Tasks ({overdueTasks.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="p-4 font-medium">Jira</th>
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Assignee</th>
                <th className="p-4 font-medium">Due Date</th>
                <th className="p-4 font-medium">Days Overdue</th>
                <th className="p-4 font-medium">Priority</th>
              </tr>
            </thead>
            <tbody>
              {overdueTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No overdue tasks. Great job!</td>
                </tr>
              ) : (
                overdueTasks.map(task => {
                  const assignee = users.find(u => u.id === task.assignee_id);
                  return (
                    <tr key={task.id} className="border-b border-gray-100 bg-red-50/30 hover:bg-red-50/60 transition-colors">
                      <td className="p-4 font-medium text-blue-600">{task.jira_ticket || '-'}</td>
                      <td className="p-4 text-gray-900 font-medium">{task.title}</td>
                      <td className="p-4 text-gray-600">{assignee?.name || 'Unassigned'}</td>
                      <td className="p-4 text-gray-600">{formatDate(task.due_date)}</td>
                      <td className="p-4 text-red-600 font-bold">{task.daysOver} days</td>
                      <td className="p-4">
                        <span className={cn("px-2 py-1 rounded text-xs font-medium", PRIORITY_COLORS[task.priority]?.bg, PRIORITY_COLORS[task.priority]?.text)}>
                          {PRIORITY_COLORS[task.priority]?.label || task.priority}
                        </span>
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
