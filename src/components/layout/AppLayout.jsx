import React from 'react';
import { Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { cn } from '../../utils/helpers';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import TaskForm from '../common/TaskForm';
import TaskDetailPanel from '../common/TaskDetailPanel';

export default function AppLayout() {
  const { sidebarCollapsed, dbReady } = useApp();

  if (!dbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      <Sidebar />
      <TopNav />

      <main
        className={cn(
          "flex-1 transition-all duration-300 mt-14 p-6 overflow-auto",
          sidebarCollapsed ? "ml-16" : "ml-60"
        )}
      >
        <Outlet />
      </main>

      <TaskForm />
      <TaskDetailPanel />
    </div>
  );
}
