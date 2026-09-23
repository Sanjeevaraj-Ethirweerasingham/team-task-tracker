import React from 'react';
import { cn } from '../../utils/helpers.js';
import { isOverdue, getDueDateLabel, formatDate } from '../../utils/dateUtils.js';
import { StatusBadge, PriorityBadge } from './Badge.jsx';
import { Avatar } from './Avatar.jsx';
import { ProgressBar } from './ProgressBar.jsx';
import { CalendarIcon, Clock } from 'lucide-react';

export function TaskCard({ task, users = [], projects = [], onClick, compact = false }) {
    if (!task) return null;

    const assignee = users.find(u => u.id === task.assignee_id);
    const project = projects.find(p => p.id === task.project_id);
    const overdue = isOverdue(task.due_date) && task.status !== 'Completed';
    const dueDateLabel = getDueDateLabel(task.due_date);

    return (
        <div
            onClick={() => onClick && onClick(task)}
            className="group flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm p-3 hover:shadow-md transition-shadow cursor-pointer w-full text-left"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {task.jira_ticket || 'No Ticket'}
                </span>
                <PriorityBadge priority={task.priority} className="scale-90 origin-right" />
            </div>

            <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2" title={task.title}>
                {task.title}
            </h4>

            {project && !compact && (
                <div className="mb-3">
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 truncate max-w-full">
                        {project.name}
                    </span>
                </div>
            )}

            {!compact && task.progress > 0 && task.status !== 'Completed' && (
                <div className="mb-3">
                    <ProgressBar value={task.progress} size="sm" showLabel={false} />
                </div>
            )}

            <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                    {assignee ? (
                        <Avatar name={assignee.name} size="sm" />
                    ) : (
                        <Avatar name="Unassigned" size="sm" className="bg-gray-300" />
                    )}
                    {!compact && assignee && (
                        <span className="text-xs text-gray-600 truncate max-w-[80px]">
                            {assignee.name.split(' ')[0]}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {!compact && <StatusBadge status={task.status} className="scale-90" />}
                    
                    {task.due_date && (
                        <div
                            className={cn(
                                'flex items-center gap-1 text-xs px-1.5 py-0.5 rounded',
                                overdue ? 'text-red-600 bg-red-50 font-medium' : 'text-gray-500'
                            )}
                            title={`Due: ${formatDate(task.due_date)}`}
                        >
                            {overdue ? <Clock className="w-3 h-3" /> : <CalendarIcon className="w-3 h-3" />}
                            <span>{dueDateLabel}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
