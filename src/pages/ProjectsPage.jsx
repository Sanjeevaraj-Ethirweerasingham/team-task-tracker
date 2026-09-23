import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { createProject } from '../db/taskService.js';
import { toast } from 'sonner';
import { computeTaskStats } from '../utils/helpers.js';

export default function ProjectsPage() {
  const { projects, allTasks, setFilters } = useApp();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.name) {
      toast.error('Project name is required');
      return;
    }
    try {
      await createProject({ ...newProject, status: 'active', created_at: new Date().toISOString() });
      toast.success('Project created successfully');
      setShowAddModal(false);
      setNewProject({ name: '', description: '' });
    } catch (err) {
      toast.error('Failed to create project');
    }
  };

  const handleProjectClick = (projectId) => {
    setFilters(prev => ({ ...prev, project: projectId }));
    navigate('/tasks');
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects ({projects.length})</h1>
          <p className="text-sm text-gray-500 mt-1">Manage projects and view progress.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
          <Plus size={16} />
          Add Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-6">
        {projects.map(project => {
          const projectTasks = allTasks.filter(t => t.project_id === project.id);
          const stats = computeTaskStats(projectTasks);
          const progress = stats.total > 0 ? Math.round(((stats.completed || 0) / stats.total) * 100) : 0;
          
          return (
            <div 
              key={project.id} 
              onClick={() => handleProjectClick(project.id)}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md cursor-pointer transition-shadow flex flex-col h-full"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{project.description || 'No description provided.'}</p>
              </div>
              
              <div className="mt-auto">
                <div className="flex justify-between items-center mb-1 text-sm font-medium">
                  <span className="text-gray-700">Progress</span>
                  <span className="text-blue-600">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                
                <div className="flex items-center justify-between text-xs pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{stats.total}</div>
                    <div className="text-gray-500">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-emerald-600">{stats.completed || 0}</div>
                    <div className="text-gray-500">Done</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{stats.inProgress || 0}</div>
                    <div className="text-gray-500">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-amber-600">{stats.pending || 0}</div>
                    <div className="text-gray-500">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-red-600">{stats.blocked || 0}</div>
                    <div className="text-gray-500">Blocked</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add Project</h2>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddProject} className="p-6">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Add Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
