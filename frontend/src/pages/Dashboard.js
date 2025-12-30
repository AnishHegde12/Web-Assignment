import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [createdTasks, setCreatedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      if (user?.role === 'manager') {
        // Managers only see tasks they created
        const createdRes = await axios.get(`${API_URL}/tasks/created?limit=5`);
        setCreatedTasks(createdRes.data.tasks || []);
        setAssignedTasks([]);
      } else {
        // Users see tasks assigned to them
        const assignedRes = await axios.get(`${API_URL}/tasks/assigned?limit=5`);
        setAssignedTasks(assignedRes.data.tasks);
        setCreatedTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircleIcon className="h-5 w-5 text-gray-400" />;
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Here's an overview of your tasks
        </p>
      </div>

      <div className={`grid gap-6 grid-cols-1`}>
        {/* Assigned Tasks (Users only) */}
        {user?.role === 'user' && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Assigned Tasks
            </h2>
            <Link
              to="/tasks"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              View all
            </Link>
          </div>
            {assignedTasks.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No tasks assigned</p>
            ) : (
              <div className="space-y-4">
                {assignedTasks.map((task) => (
                  <div
                    key={task._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {task.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {task.status}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Priority: {task.priority}
                          </span>
                        </div>
                      </div>
                      {getStatusIcon(task.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Created Tasks (Managers only) */}
        {user?.role === 'manager' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Created Tasks
              </h2>
              <Link
                to="/tasks"
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                View all
              </Link>
            </div>
            {createdTasks.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No tasks created</p>
            ) : (
              <div className="space-y-4">
                {createdTasks.map((task) => (
                  <div
                    key={task._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {task.description}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Assigned to: {task.assignedTo?.name}
                        </p>
                        <div className="mt-2 flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {task.status}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Priority: {task.priority}
                          </span>
                        </div>
                      </div>
                      {getStatusIcon(task.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

