import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { computeTaskStats, getInitials } from '../utils/helpers';
import { formatRelative } from '../utils/dateUtils';
import { 
  ListTodo, Clock, Loader, Ban, CheckCircle2, AlertTriangle 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function KPICard({ title, count, icon: Icon, colorClass, bgClass, onClick }) {
  return (
    <div 
      className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-2"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bgClass}`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
        <span className="text-sm font-medium text-gray-500">{title}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900 mt-1 pl-1">{count}</div>
    </div>
  );
}

export default function Dashboard() {
  const { allTasks, currentUser, setSelectedTaskId, setFilters, users } = useApp();
  const navigate = useNavigate();

  const stats = computeTaskStats(allTasks);

  const [activities, setActivities] = React.useState([]);

  React.useEffect(() => {
    const fetchActivities = async () => {
      const { data } = await import('../db/supabase').then(m => m.supabase)
        .from('task_activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setActivities(data);
    };
    fetchActivities();
  }, [allTasks]); // Refetch when tasks update

  const myTasks = allTasks
    .filter(t => t.assignee_id === currentUser?.id && t.status !== 'Completed')
    .slice(0, 5);

  const handleKpiClick = (status) => {
    if (status === 'Overdue') {
      // Custom overdue filter handling could go here if supported by setFilters
      navigate('/tasks');
    } else if (status === 'Total Tasks') {
      setFilters(prev => ({ ...prev, status: '' }));
      navigate('/tasks');
    } else {
      setFilters(prev => ({ ...prev, status }));
      navigate('/tasks');
    }
  };

  const workloadData = users?.map(u => ({
    name: u.name,
    tasks: allTasks.filter(t => t.assignee_id === u.id && t.status !== 'Completed').length
  })) || [];

  return (
    <div className="space-y-6">
      {/* A. KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="Total Tasks" count={stats.total} icon={ListTodo} colorClass="text-blue-600" bgClass="bg-blue-50" onClick={() => handleKpiClick('Total Tasks')} />
        <KPICard title="Pending" count={stats.pending} icon={Clock} colorClass="text-amber-600" bgClass="bg-amber-50" onClick={() => handleKpiClick('Pending')} />
        <KPICard title="In Progress" count={stats.inProgress} icon={Loader} colorClass="text-blue-600" bgClass="bg-blue-50" onClick={() => handleKpiClick('In Progress')} />
        <KPICard title="Blocked" count={stats.blocked} icon={Ban} colorClass="text-red-600" bgClass="bg-red-50" onClick={() => handleKpiClick('Blocked')} />
        <KPICard title="Completed" count={stats.completed} icon={CheckCircle2} colorClass="text-emerald-600" bgClass="bg-emerald-50" onClick={() => handleKpiClick('Completed')} />
        <KPICard title="Overdue" count={stats.overdue} icon={AlertTriangle} colorClass="text-rose-600" bgClass="bg-rose-50" onClick={() => handleKpiClick('Overdue')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* B. My Tasks */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Tasks</h2>
            <Link to="/my-tasks" className="text-sm font-medium text-primary-600 hover:text-primary-700">View All →</Link>
          </div>
          <div className="space-y-3">
            {myTasks.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">No active tasks assigned to you.</div>
            ) : (
              myTasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => setSelectedTaskId(task.id)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.priority === 'Critical' ? 'bg-red-500' : task.priority === 'High' ? 'bg-orange-500' : task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <span className="text-xs font-medium text-gray-500 w-16 flex-shrink-0">{task.jira_ticket || 'No Ticket'}</span>
                  <span className="text-sm font-medium text-gray-900 truncate flex-1">{task.title}</span>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 flex-shrink-0">{task.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* C. Team Workload */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Workload</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* D. Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {!activities || activities.length === 0 ? (
            <div className="text-sm text-gray-500 py-2">No recent activity.</div>
          ) : (
            activities.map(act => {
              const u = users?.find(user => user.id === act.user_id);
              const t = allTasks.find(task => task.id === act.task_id);
              return (
                <div key={act.id} className="flex gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {u ? getInitials(u.name) : '?'}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="text-gray-800">
                      <span className="font-medium">{u?.name || 'Unknown'}</span>
                      {' '}updated{' '}
                      <span className="font-medium cursor-pointer text-primary-600 hover:underline" onClick={() => setSelectedTaskId(act.task_id)}>
                        {t ? (t.jira_ticket || t.title) : 'a task'}
                      </span>
                      : {act.activity_type} {act.new_value && `to ${act.new_value}`}
                    </span>
                    <span className="text-xs text-gray-500">{formatRelative(act.created_at)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
