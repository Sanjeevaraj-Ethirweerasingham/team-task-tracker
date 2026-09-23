import React from 'react';
import { cn } from '../../utils/helpers.js';

export function KPICard({ label, value, icon: Icon, color = 'blue', active, onClick }) {
    const colorStyles = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-500' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-500' },
        red: { bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-500' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-500' },
        slate: { bg: 'bg-slate-50', text: 'text-slate-600', ring: 'ring-slate-500' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-500' },
    };

    const style = colorStyles[color] || colorStyles.blue;

    return (
        <div
            onClick={onClick}
            className={cn(
                'flex items-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-200',
                onClick && 'cursor-pointer hover:shadow-md hover:border-gray-300',
                active && `ring-2 ring-offset-1 ${style.ring} border-transparent`
            )}
        >
            <div className={cn('p-3 rounded-lg mr-4', style.bg, style.text)}>
                {Icon && <Icon className="w-6 h-6" />}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
            </div>
        </div>
    );
}
