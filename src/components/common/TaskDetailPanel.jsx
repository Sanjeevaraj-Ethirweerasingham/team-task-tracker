import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { supabase } from '../../db/supabase.js';
import { addComment, deleteTask, getSetting } from '../../db/taskService.js';
import { DEFAULT_JIRA_BASE_URL } from '../../utils/constants.js';
import { formatDate } from '../../utils/dateUtils.js';
import { Avatar } from './Avatar.jsx';
import { ConfirmDialog } from './ConfirmDialog.jsx';
import { StatusBadge, PriorityBadge } from './Badge.jsx';
import { ProgressBar } from './ProgressBar.jsx';
import { X, Edit2, Trash2, ExternalLink, MessageSquare, Activity, User, Calendar, Folder, AlignLeft, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function TaskDetailPanel() {
    const { selectedTaskId, setSelectedTaskId, users, projects, openEditTask, currentUserId, allTasks, refreshData } = useApp();
    const [jiraBaseUrl, setJiraBaseUrl] = useState(DEFAULT_JIRA_BASE_URL);
    const [commentText, setCommentText] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    // Data state
    const [comments, setComments] = useState([]);
    const [activities, setActivities] = useState([]);

    const task = allTasks.find(t => t.id === selectedTaskId);

    useEffect(() => {
        const fetchJiraUrl = async () => {
            const val = await getSetting('jiraBaseUrl');
            if (val) setJiraBaseUrl(val);
        };
        fetchJiraUrl();
    }, []);

    useEffect(() => {
        if (!selectedTaskId) return;
        
        const fetchDetails = async () => {
            const [commentsRes, activitiesRes] = await Promise.all([
                supabase.from('task_comments').select('*').eq('task_id', selectedTaskId).order('created_at', { ascending: true }),
                supabase.from('task_activity').select('*').eq('task_id', selectedTaskId).order('created_at', { ascending: true })
            ]);
            
            if (commentsRes.data) setComments(commentsRes.data);
            if (activitiesRes.data) setActivities(activitiesRes.data);
        };
        
        fetchDetails();
    }, [selectedTaskId, task]); // re-fetch if task changes (e.g. via real-time)

    if (!selectedTaskId || !task) return null;

    const project = projects.find(p => p.id === task.project_id);
    const assignee = users.find(u => u.id === task.assignee_id);
    const assignedBy = users.find(u => u.id === task.assigned_by_id);

    const handleClose = () => setSelectedTaskId(null);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            const newComment = await addComment(task.id, currentUserId, commentText.trim());
            setComments(prev => [...prev, newComment]);
            setCommentText('');
            toast.success('Comment added');
        } catch (error) {
            console.error('Error adding comment:', error);
            toast.error('Failed to add comment');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteTask(task.id);
            toast.success('Task deleted');
            setShowDeleteConfirm(false);
            handleClose();
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Failed to delete task');
        }
    };

    const jiraLink = task.jira_ticket ? `${jiraBaseUrl}/browse/${task.jira_ticket}` : null;

    return (
        <>
            <div className="fixed inset-0 bg-black/20 z-30 transition-opacity" onClick={handleClose} />
            
            <div className="fixed top-0 right-0 w-full max-w-lg h-full bg-white shadow-xl z-40 overflow-y-auto flex flex-col transform transition-transform duration-300">
                
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
                    <div className="flex gap-2">
                        <button onClick={() => openEditTask(task)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Task">
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setShowDeleteConfirm(true)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Task">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    <button onClick={handleClose} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex-1 space-y-8">
                    
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <StatusBadge status={task.status} />
                            <PriorityBadge priority={task.priority} />
                            {task.jira_ticket && (
                                <a href={jiraLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-md">
                                    {task.jira_ticket}
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
                    </div>

                    
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1"><Folder className="w-3.5 h-3.5"/> Project</span>
                            <span className="text-sm text-gray-900">{project?.name || 'None'}</span>
                        </div>
                        <div>
                            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1"><User className="w-3.5 h-3.5"/> Assignee</span>
                            <div className="flex items-center gap-2">
                                <Avatar name={assignee?.name} size="sm" />
                                <span className="text-sm text-gray-900">{assignee?.name || 'Unassigned'}</span>
                            </div>
                        </div>
                        <div>
                            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1"><Calendar className="w-3.5 h-3.5"/> Due Date</span>
                            <span className="text-sm text-gray-900">{task.due_date ? formatDate(task.due_date) : 'Not set'}</span>
                        </div>
                        <div>
                            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1"><Calendar className="w-3.5 h-3.5"/> Start Date</span>
                            <span className="text-sm text-gray-900">{task.start_date ? formatDate(task.start_date) : 'Not set'}</span>
                        </div>
                        {task.completed_date && (
                            <div className="col-span-2">
                                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1"><Calendar className="w-3.5 h-3.5"/> Completed</span>
                                <span className="text-sm text-gray-900">{formatDate(task.completed_date)}</span>
                            </div>
                        )}
                        <div className="col-span-2 mt-2">
                            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1"><Activity className="w-3.5 h-3.5"/> Progress</span>
                            <ProgressBar value={task.progress} size="md" />
                        </div>
                    </div>

                    
                    {task.description && (
                        <div>
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                                <AlignLeft className="w-4 h-4 text-gray-500" /> Description
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
                                {task.description}
                            </div>
                        </div>
                    )}

                    {task.notes && (
                        <div>
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                                <FileText className="w-4 h-4 text-gray-500" /> Notes
                            </h3>
                            <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-900 whitespace-pre-wrap">
                                {task.notes}
                            </div>
                        </div>
                    )}

                    
                    <div>
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
                            <MessageSquare className="w-4 h-4 text-gray-500" /> Comments
                        </h3>
                        
                        <div className="space-y-4 mb-4">
                            {comments?.length === 0 ? (
                                <p className="text-sm text-gray-500 italic text-center py-2">No comments yet</p>
                            ) : (
                                comments?.map(comment => {
                                    const commentUser = users.find(u => u.id === comment.user_id);
                                    return (
                                        <div key={comment.id} className="flex gap-3">
                                            <Avatar name={commentUser?.name} size="sm" />
                                            <div className="flex-1 bg-gray-50 rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-semibold text-gray-900">{commentUser?.name || 'Unknown'}</span>
                                                    <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                                                </div>
                                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        <form onSubmit={handleAddComment} className="flex gap-2">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                rows={2}
                            />
                            <button
                                type="submit"
                                disabled={!commentText.trim()}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed self-end"
                            >
                                Send
                            </button>
                        </form>
                    </div>

                    
                    {activities && activities.length > 0 && (
                        <div>
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
                                <Activity className="w-4 h-4 text-gray-500" /> Activity Timeline
                            </h3>
                            <div className="relative border-l border-gray-200 ml-3 space-y-4 pb-4">
                                {activities.map(activity => {
                                    const actUser = users.find(u => u.id === activity.user_id);
                                    let description = 'updated the task';
                                    
                                    if (activity.activity_type === 'status_change') {
                                        description = `changed status from ${activity.old_value} to ${activity.new_value}`;
                                    } else if (activity.activity_type === 'priority_change') {
                                        description = `changed priority to ${activity.new_value}`;
                                    } else if (activity.activity_type === 'progress_update') {
                                        description = `updated progress to ${activity.new_value}%`;
                                    } else if (activity.activity_type === 'assignment_change') {
                                        const newAssignee = users.find(u => u.id === activity.new_value);
                                        description = `assigned task to ${newAssignee?.name || 'Unassigned'}`;
                                    } else if (activity.activity_type === 'creation') {
                                        description = `created the task`;
                                    }

                                    return (
                                        <div key={activity.id} className="relative pl-6">
                                            <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-gray-200 rounded-full border-2 border-white" />
                                            <div className="text-sm">
                                                <span className="font-medium text-gray-900">{actUser?.name || 'System'}</span>
                                                <span className="text-gray-500 ml-1">{description}</span>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5">
                                                {formatDate(activity.created_at)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Task"
                message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
                confirmText="Delete Task"
                variant="danger"
            />
        </>
    );
}
