import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { STATUS_LIST, PRIORITY_LIST } from '../../utils/constants.js';

export function FilterBar({ showProjectFilter = true }) {
    const { 
        filters, 
        setFilters, 
        clearFilters, 
        hasActiveFilters, 
        users, 
        projects 
    } = useApp();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    return (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-white border-b border-gray-200 w-full">
            <select
                name="status"
                value={filters.status || ''}
                onChange={handleChange}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2"
            >
                <option value="">All Statuses</option>
                {STATUS_LIST.map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </select>

            <select
                name="priority"
                value={filters.priority || ''}
                onChange={handleChange}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2"
            >
                <option value="">All Priorities</option>
                {PRIORITY_LIST.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                ))}
            </select>

            <select
                name="assignee_id"
                value={filters.assignee_id || ''}
                onChange={handleChange}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 max-w-[150px] truncate"
            >
                <option value="">All Assignees</option>
                {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                ))}
            </select>

            <select
                name="assigned_by_id"
                value={filters.assigned_by_id || ''}
                onChange={handleChange}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 max-w-[150px] truncate"
            >
                <option value="">Assigned By</option>
                {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                ))}
            </select>

            {showProjectFilter && (
                <select
                    name="project_id"
                    value={filters.project_id || ''}
                    onChange={handleChange}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 max-w-[180px] truncate"
                >
                    <option value="">All Projects</option>
                    {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                </select>
            )}

            {hasActiveFilters && (
                <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-2 rounded hover:bg-blue-50 transition-colors"
                >
                    Clear Filters
                </button>
            )}
        </div>
    );
}
