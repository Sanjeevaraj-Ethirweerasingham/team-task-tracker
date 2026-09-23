import React from 'react';
import { cn } from '../../utils/helpers.js';

export function ProgressBar({ value = 0, size = 'md', showLabel = true, className }) {
    const safeValue = Math.min(Math.max(Number(value) || 0, 0), 100);

    let colorClass = 'bg-blue-500';
    if (safeValue === 100) colorClass = 'bg-emerald-500';
    else if (safeValue < 30) colorClass = 'bg-red-500';
    else if (safeValue <= 70) colorClass = 'bg-amber-500';

    const sizeClasses = {
        sm: 'h-1.5',
        md: 'h-2',
        lg: 'h-3'
    };

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <div className="flex-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={cn('transition-all duration-300 ease-in-out rounded-full', sizeClasses[size], colorClass)}
                    style={{ width: `${safeValue}%` }}
                />
            </div>
            {showLabel && (
                <span className="text-xs font-medium text-gray-600 w-8 text-right">
                    {Math.round(safeValue)}%
                </span>
            )}
        </div>
    );
}
