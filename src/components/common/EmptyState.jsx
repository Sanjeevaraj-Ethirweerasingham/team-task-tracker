import React from 'react';
import { cn } from '../../utils/helpers.js';

export function EmptyState({ icon: Icon, title, description, action, onAction, className }) {
    return (
        <div className={cn('flex flex-col items-center justify-center p-8 text-center bg-white border border-gray-200 rounded-xl border-dashed', className)}>
            {Icon && (
                <div className="p-4 rounded-full bg-gray-50 mb-4">
                    <Icon className="w-10 h-10 text-gray-400" />
                </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                    {description}
                </p>
            )}
            {action && onAction && (
                <button
                    onClick={onAction}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    {action}
                </button>
            )}
        </div>
    );
}
