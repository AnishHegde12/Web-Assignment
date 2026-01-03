import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange, canChangeStatus = false }) => {
  // Function to determine the color class for priority badges based on priority level
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-600">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
          {task.title}
        </h3>
        <div className="flex space-x-1">
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task._id)}
              className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-3 items-center">
        {canChangeStatus && onStatusChange && task.status !== 'completed' ? (
          <select
            value={task.status}
            onChange={(e) => {
              e.stopPropagation();
              onStatusChange(task._id, e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className={`px-2 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(
              task.status
            )}`}
          >
            <option value="pending">pending</option>
            <option value="in-progress">in-progress</option>
            <option value="completed">completed</option>
          </select>
        ) : (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
              task.status
            )}`}
          >
            {task.status}
          </span>
        )}
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
            task.priority
          )}`}
        >
          {task.priority} priority
        </span>
      </div>

      {task.assignedTo && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          Assigned to: {task.assignedTo?.name || 'Unknown'}
        </p>
      )}

      {task.createdBy && task.createdBy._id !== task.assignedTo?._id && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          Created by: {task.createdBy?.name || 'Unknown'}
        </p>
      )}

      {task.dueDate && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Due: {formatDate(task.dueDate)}
        </p>
      )}
    </div>
  );
};

export default TaskCard;

