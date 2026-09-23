import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { setSetting, getSetting } from '../db/taskService.js';
import { supabase } from '../db/supabase.js';
import { toast } from 'sonner';
import { AlertTriangle, Download } from 'lucide-react';
import { exportTasksToCSV } from '../utils/csvUtils.js';

export default function SettingsPage() {
  const { users, projects, allTasks } = useApp();
  const [jiraUrl, setJiraUrl] = useState('');
  
  useEffect(() => {
    getSetting('jiraBaseUrl').then(url => {
      if (url) setJiraUrl(url);
    });
  }, []);

  const handleSaveJiraUrl = async () => {
    try {
      await setSetting('jiraBaseUrl', jiraUrl);
      toast.success('Jira configuration saved');
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  const handleExport = () => {
    try {
      exportTasksToCSV(allTasks, users, projects);
      toast.success('Data exported successfully');
    } catch (e) {
      toast.error('Failed to export data');
    }
  };

  const handleFreshStart = async () => {
    if (!window.confirm('This will remove ALL data (tasks, team members, projects) for EVERYONE. Continue?')) return;
    
    try {
      toast.info('Clearing all data...');
      
      // Delete everything using Supabase client
      await Promise.all([
        supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('tags').delete().neq('id', '00000000-0000-0000-0000-000000000000')
        // note: task_comments, task_activity, task_tags auto-delete due to foreign key cascade
      ]);
      
      toast.success('All data cleared! You now have a fresh workspace.');
      window.location.reload();
    } catch (e) {
      console.error(e);
      toast.error('Failed to clear data');
    }
  };

  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto bg-gray-50/50">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage application preferences and data.</p>
      </div>

      <div className="space-y-6 max-w-3xl">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Jira Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jira Base URL</label>
              <div className="flex gap-3">
                <input 
                  type="url" 
                  value={jiraUrl} 
                  onChange={(e) => setJiraUrl(e.target.value)} 
                  placeholder="https://company.atlassian.net" 
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button 
                  onClick={handleSaveJiraUrl} 
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Save
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Enter your Jira instance URL to enable direct links from Jira tickets.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm border-t-4 border-t-red-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={20} />
            Data Management
          </h2>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <h3 className="font-medium text-gray-900">Export Data</h3>
                <p className="text-sm text-gray-500 mt-1">Download all tasks as a CSV file.</p>
              </div>
              <button 
                onClick={handleExport}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Download size={18} />
                Export CSV
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <h3 className="font-medium text-red-900">🚀 Fresh Start</h3>
                <p className="text-sm text-red-700 mt-1">Remove all tasks, tags and projects. (Team members remain). This affects everyone on the team.</p>
              </div>
              <button 
                onClick={handleFreshStart}
                className="flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm whitespace-nowrap"
              >
                ✨ Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
