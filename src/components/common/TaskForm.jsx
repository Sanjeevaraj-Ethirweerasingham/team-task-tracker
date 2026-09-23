import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { createTask, updateTask } from '../../db/taskService.js';
import { toast } from 'sonner';
import { STATUS_LIST, PRIORITY_LIST } from '../../utils/constants.js';
import { formatDateForInput } from '../../utils/dateUtils.js';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function TaskForm() {
    const { showTaskForm, editingTask, closeTaskForm, users, projects, currentUserId } = useApp();
    const [showMore, setShowMore] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        jira_ticket: '',
        status: 'Pending',
        priority: 'Medium',
        assignee_id: currentUserId || '',
        assigned_by_id: currentUserId || '',
        project_id: '',
        due_date: '',
        start_date: '',
        progress: 0,
        description: '',
        notes: ''
    });

    useEffect(() => {
        if (editingTask) {
            setFormData({
                title: editingTask.title || '',
                jira_ticket: editingTask.jira_ticket || '',
                status: editingTask.status || 'Pending',
                priority: editingTask.priority || 'Medium',
                assignee_id: editingTask.assignee_id || '',
                assigned_by_id: editingTask.assigned_by_id || currentUserId || '',
                project_id: editingTask.project_id || '',
                due_date: editingTask.due_date ? formatDateForInput(editingTask.due_date) : '',
                start_date: editingTask.start_date ? formatDateForInput(editingTask.start_date) : '',
                progress: editingTask.progress || 0,
                description: editingTask.description || '',
                notes: editingTask.notes || ''
            });
            setShowMore(true);
        } else {
            setFormData({
                title: '',
                jira_ticket: '',
                status: 'Pending',
                priority: 'Medium',
                assignee_id: currentUserId || '',
                assigned_by_id: currentUserId || '',
                project_id: '',
                due_date: '',
                start_date: '',
                progress: 0,
                description: '',
                notes: ''
            });
            setShowMore(false);
        }
    }, [editingTask, currentUserId, showTaskForm]);

    if (!showTaskForm) return null;

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' || type === 'range' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const taskPayload = { ...formData };
            if (taskPayload.due_date) taskPayload.due_date = new Date(taskPayload.due_date).toISOString();
            else taskPayload.due_date = null;

            if (taskPayload.start_date) taskPayload.start_date = new Date(taskPayload.start_date).toISOString();
            else taskPayload.start_date = null;

            if (editingTask) {
                await updateTask(editingTask.id, taskPayload, currentUserId);
                toast.success('Task updated successfully');
            } else {
                await createTask(taskPayload, currentUserId);
                toast.success('Task created successfully');
            }
            closeTaskForm();
        } catch (error) {
            console.error('Error saving task:', error);
            toast.error('Failed to save task');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/30 transition-opacity" onClick={closeTaskForm} />
            
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {editingTask ? 'Edit Task' : 'Create Task'}
                    </h2>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <form id="task-form" onSubmit={handleSubmit} className="space-y-6">
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter task title"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
                                    <select
                                        name="status"
                                        required
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority <span className="text-red-500">*</span></label>
                                    <select
                                        name="priority"
                                        required
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {PRIORITY_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assignee <span className="text-red-500">*</span></label>
                                    <select
                                        name="assignee_id"
                                        required
                                        value={formData.assignee_id}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Assignee</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        name="due_date"
                                        required
                                        value={formData.due_date}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowMore(!showMore)}
                                className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                {showMore ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                                {showMore ? 'Hide Options' : 'More Options'}
                            </button>
                        </div>

                        {showMore && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Jira Ticket</label>
                                        <input
                                            type="text"
                                            name="jira_ticket"
                                            value={formData.jira_ticket}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="CSI-1234"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                                        <select
                                            name="project_id"
                                            value={formData.project_id}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Project</option>
                                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned By</label>
                                        <select
                                            name="assigned_by_id"
                                            value={formData.assigned_by_id}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select User</option>
                                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Progress: {formData.progress}%
                                    </label>
                                    <input
                                        type="range"
                                        name="progress"
                                        min="0"
                                        max="100"
                                        value={formData.progress}
                                        onChange={handleChange}
                                        className="w-full accent-blue-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        rows={3}
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Add task description..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea
                                        name="notes"
                                        rows={2}
                                        value={formData.notes}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Add private notes or findings..."
                                    />
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <button
                        type="button"
                        onClick={closeTaskForm}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="task-form"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        {editingTask ? 'Save Changes' : 'Create Task'}
                    </button>
                </div>
            </div>
        </div>
    );
}
