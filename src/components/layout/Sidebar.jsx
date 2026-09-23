import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { cn } from '../../utils/helpers';
import {
  LayoutDashboard,
  User,
  ListTodo,
  Columns3,
  Users,
  FolderKanban,
  CalendarDays,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'My Tasks', icon: User, path: '/my-tasks' },
  { name: 'All Tasks', icon: ListTodo, path: '/tasks' },
  { name: 'Kanban', icon: Columns3, path: '/kanban' },
  { name: 'Team', icon: Users, path: '/team' },
  { name: 'Projects', icon: FolderKanban, path: '/projects' },
  { name: 'Calendar', icon: CalendarDays, path: '/calendar' },
  { name: 'Reports', icon: BarChart3, path: '/reports' },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useApp();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-20 transition-all duration-300 flex flex-col justify-between",
        sidebarCollapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
        <div className="flex items-center justify-center h-14 border-b border-gray-200 px-4 whitespace-nowrap">
          {!sidebarCollapsed ? (
            <span className="text-xl font-bold text-gray-900 truncate flex items-center gap-2">
              📋 TeamTrack
            </span>
          ) : (
            <span className="text-xl font-bold">📋</span>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
                  isActive
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors",
                  sidebarCollapsed ? "mx-auto" : ""
                )}
              />
              {!sidebarCollapsed && <span>{item.name}</span>}
            </NavLink>
          ))}

          <div className="pt-4 mt-4 border-t border-gray-200">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
                  isActive
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <Settings className={cn("w-5 h-5 flex-shrink-0", sidebarCollapsed ? "mx-auto" : "")} />
              {!sidebarCollapsed && <span>Settings</span>}
            </NavLink>
          </div>
        </nav>
      </div>

      <div className="p-3 border-t border-gray-200 flex justify-center">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}
