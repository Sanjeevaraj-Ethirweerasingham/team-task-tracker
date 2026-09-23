import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Trash2 } from 'lucide-react';
import { createUser, deleteUser } from '../db/taskService.js';
import { toast } from 'sonner';
import { computeTaskStats, getInitials, cn, getColorIndex } from '../utils/helpers.js';
import { AVATAR_COLORS } from '../utils/constants.js';

export default function TeamPage() {
  const { users, allTasks } = useApp();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: '' });

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email || !newMember.role) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await createUser({ ...newMember, active: true });
      toast.success('Team member added successfully');
      setShowAddModal(false);
      setNewMember({ name: '', email: '', role: '' });
    } catch (err) {
      toast.error('Failed to add team member');
    }
  };

  const handleDeleteMember = async (e, userId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this team member?")) {
      try {
        await deleteUser(userId);
        toast.success("Team member removed");
      } catch (err) {
        toast.error("Failed to remove team member");
      }
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team ({users.length})</h1>
          <p className="text-sm text-gray-500 mt-1">Manage team members and view workload.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
          <Plus size={16} />
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-6">
        {users.map(user => {
          const stats = computeTaskStats(allTasks.filter(t => t.assignee_id === user.id));
          const colorClass = AVATAR_COLORS[getColorIndex(user.id)];
          return (
            <div 
              key={user.id} 
              onClick={() => navigate(`/team/${user.id}`)}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md cursor-pointer transition-shadow"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0", colorClass.bg, colorClass.text)}>
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteMember(e, user.id)}
                  className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                  title="Remove Member"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Total Tasks</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg">
                  <p className="text-xs text-amber-600 mb-1">Pending</p>
                  <p className="text-lg font-semibold text-amber-700">{stats.pending || 0}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">In Progress</p>
                  <p className="text-lg font-semibold text-blue-700">{stats.inProgress || 0}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-xs text-red-600 mb-1">Overdue</p>
                  <p className="text-lg font-semibold text-red-700">{stats.overdue}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-xs text-red-600 mb-1">Blocked</p>
                  <p className="text-lg font-semibold text-red-700">{stats.blocked || 0}</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg">
                  <p className="text-xs text-emerald-600 mb-1">Completed</p>
                  <p className="text-lg font-semibold text-emerald-700">{stats.completed || 0}</p>
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
              <h2 className="text-lg font-semibold text-gray-900">Add Team Member</h2>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddMember} className="p-6">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={newMember.email} onChange={(e) => setNewMember({...newMember, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input type="text" value={newMember.role} onChange={(e) => setNewMember({...newMember, role: e.target.value})} placeholder="e.g., Frontend Developer" className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" required />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
