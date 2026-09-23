import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MyTasks from './pages/MyTasks.jsx';
import AllTasks from './pages/AllTasks.jsx';
import KanbanBoard from './pages/KanbanBoard.jsx';
import TeamPage from './pages/TeamPage.jsx';
import MemberWorkload from './pages/MemberWorkload.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

// Auth Guard Component
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route 
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/my-tasks" element={<MyTasks />} />
        <Route path="/tasks" element={<AllTasks />} />
        <Route path="/kanban" element={<KanbanBoard />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/team/:userId" element={<MemberWorkload />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
