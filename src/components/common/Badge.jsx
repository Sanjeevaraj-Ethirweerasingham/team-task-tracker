import React from 'react';
import { cn } from '../../utils/helpers.js';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants.js';

export function StatusBadge({ status, className }) {
    const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    return (
        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', colorClass, className)}>
            {status}
        </span>
    );
}

export function PriorityBadge({ priority, className }) {
    const colorClass = PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
    return (
        <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', colorClass, className)}>
            {priority}
        </span>
    );
}

export function PriorityDot({ priority, className }) {
    let colorClass = 'bg-gray-400';
    if (priority === 'Critical') colorClass = 'bg-red-500';
    else if (priority === 'High') colorClass = 'bg-orange-500';
    else if (priority === 'Medium') colorClass = 'bg-yellow-500';
    else if (priority === 'Low') colorClass = 'bg-green-500';

    return <span className={cn('h-2 w-2 rounded-full', colorClass, className)} aria-hidden="true" />;
}
