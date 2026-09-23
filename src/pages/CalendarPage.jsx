import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCalendarDays, isSameMonth, isSameDay, addMonths, subMonths, isDueToday, isDueThisWeek, isOverdue } from '../utils/dateUtils.js';
import { cn } from '../utils/helpers.js';

export default function CalendarPage() {
  const { allTasks, setSelectedTaskId } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  const days = getCalendarDays(currentMonth);

  const getTaskColor = (task) => {
    if (task.status === 'completed') return 'bg-emerald-100 text-emerald-700 line-through';
    if (task.due_date && isOverdue(task.due_date, task.status)) return 'bg-red-100 text-red-700';
    if (task.due_date && isDueToday(task.due_date)) return 'bg-amber-100 text-amber-700';
    if (task.due_date && isDueThisWeek(task.due_date)) return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">View task deadlines across the month.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentMonth(today)} className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">Today</button>
          <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 text-gray-600 hover:bg-gray-50"><ChevronLeft size={20} /></button>
            <span className="px-4 font-semibold text-gray-700 min-w-[140px] text-center">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 text-gray-600 hover:bg-gray-50"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 auto-rows-[minmax(100px,1fr)]">
          {days.map((day, i) => {
            const isCurrMonth = isSameMonth(day, currentMonth);
            const isDayToday = isSameDay(day, today);
            const dayTasks = allTasks.filter(t => t.due_date && isSameDay(new Date(t.due_date), day));
            
            const visibleTasks = dayTasks.slice(0, 3);
            const hiddenCount = dayTasks.length - 3;

            return (
              <div key={i} className={cn("border-b border-r border-gray-100 p-2 overflow-y-auto", !isCurrMonth && "bg-gray-50", isDayToday && "bg-blue-50 ring-inset ring-2 ring-blue-400")}>
                <div className={cn("text-sm font-medium mb-1.5 w-7 h-7 flex items-center justify-center rounded-full", isDayToday ? "bg-blue-600 text-white" : (isCurrMonth ? "text-gray-900" : "text-gray-400"))}>
                  {day.getDate()}
                </div>
                <div className="flex flex-col gap-1">
                  {visibleTasks.map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => setSelectedTaskId(task.id)}
                      className={cn("text-xs truncate px-2 py-1 rounded cursor-pointer font-medium shadow-sm transition-opacity hover:opacity-80", getTaskColor(task))}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {hiddenCount > 0 && (
                    <div className="text-xs text-gray-500 font-medium px-1 mt-0.5">
                      +{hiddenCount} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
