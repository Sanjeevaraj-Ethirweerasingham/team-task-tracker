import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { cn, getInitials } from '../../utils/helpers';
import { Search, Plus, Bell, LogOut } from 'lucide-react';
import { toast } from 'sonner';

const routeTitles = {
  '/': 'Dashboard',
  '/my-tasks': 'My Tasks',
  '/tasks': 'All Tasks',
  '/kanban': 'Kanban Board',
  '/team': 'Team',
  '/projects': 'Projects',
  '/calendar': 'Calendar',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export default function TopNav() {
  const { currentUser, openAddTask, filters, setFilters, sidebarCollapsed } = useApp();
  const { signOut } = useAuth();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  
  const pageTitle = routeTitles[location.pathname] || 'TeamTrack';

  useEffect(() => {
    const timer = setTimeout(() => {
      if (setFilters) {
        setFilters((prev) => ({ ...prev, search: searchTerm }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, setFilters]);

  // Sync state if filters.search changes externally
  useEffect(() => {
    if (filters?.search !== searchTerm) {
      setSearchTerm(filters?.search || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.search]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (e) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-14 bg-white border-b border-gray-200 z-10 transition-all duration-300 flex items-center justify-between px-6",
        sidebarCollapsed ? "left-16" : "left-60"
      )}
    >
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
      </div>

      <div className="flex-1 max-w-md mx-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-1.5 border-transparent rounded-full bg-gray-100 text-sm placeholder-gray-500 focus:border-primary-500 focus:bg-white focus:ring-1 focus:ring-primary-500 transition-colors"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={openAddTask}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </button>

        {currentUser && (
          <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-medium border border-primary-200">
                {getInitials(currentUser.name)}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {currentUser.name}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-600 focus:outline-none p-1.5 rounded-full hover:bg-red-50 transition-colors ml-1"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
