import React from 'react';
import { cn, getInitials, getColorIndex } from '../../utils/helpers.js';
import { AVATAR_COLORS } from '../../utils/constants.js';

export function Avatar({ name, size = 'md', className }) {
    const initials = getInitials(name || 'Unknown');
    const colorIndex = getColorIndex(name || 'Unknown');
    const colorClass = AVATAR_COLORS[colorIndex] || 'bg-gray-500';

    const sizeClasses = {
        sm: 'w-6 h-6 text-xs',
        md: 'w-8 h-8 text-sm',
        lg: 'w-10 h-10 text-base',
        xl: 'w-12 h-12 text-lg'
    };

    return (
        <div 
            className={cn('flex flex-shrink-0 items-center justify-center rounded-full text-white font-medium', colorClass, sizeClasses[size], className)} 
            title={name}
        >
            {initials}
        </div>
    );
}
