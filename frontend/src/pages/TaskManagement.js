import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import TaskForm from '../components/TaskForm';
import TaskCard from '../components/TaskCard';
import { PlusIcon } from '@heroicons/react/24/outline';
import io from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const TaskManagement = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [statusChangeData, setStatusChangeData] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchTasks();

    // WebSocket connection
    const socket = io(SOCKET_URL);
    if (user?.id) {
      socket.emit('join-room', user.id);
    }

    socket.on('task-updated', (data) => {
      fetchTasks();
    });

    socket.on('task-deleted', (data) => {
      setTasks((prev) => prev.filter((task) => task._id !== data.taskId));
    });

    return () => {
      socket.disconnect();
    };
  }, [user, page]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/tasks?page=${page}&limit=10`);
      setTasks(response.data.tasks);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleCreateTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${API_URL}/tasks/${taskId}`);
        setTasks(tasks.filter((task) => task._id !== taskId));
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Error deleting task');
      }
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    setStatusChangeData({ taskId, newStatus });
    setComment('');
    setShowCommentModal(true);
  };

  const handleStatusChangeSubmit = async () => {
    if (!comment.trim()) {
      alert('Comment is required');
      return;
    }
    try {
      await axios.put(`${API_URL}/tasks/${statusChangeData.taskId}`, { status: statusChangeData.newStatus, comment });
      // Optimistically update UI
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === statusChangeData.taskId ? { ...task, status: statusChangeData.newStatus } : task
        )
      );
      setShowCommentModal(false);
      setStatusChangeData(null);
      setComment('');
    } catch (error) {
      console.error('Error updating task status:', error);
      fetchTasks(); // Revert by fetching tasks again
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTask(null);
    fetchTasks();
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const taskId = draggableId;

    // Determine new status based on destination droppableId
    const statusMap = {
      'pending-column': 'pending',
      'in-progress-column': 'in-progress',
      'completed-column': 'completed'
    };

    const newStatus = statusMap[destination.droppableId];
    if (!newStatus) return;

    try {
      await axios.put(`${API_URL}/tasks/${taskId}`, { status: newStatus });
      // Optimistically update UI
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
      fetchTasks(); // Revert by fetching tasks again
    }
  };

  const groupTasksByStatus = (tasks) => {
    return {
      pending: tasks.filter((task) => task.status === 'pending'),
      'in-progress': tasks.filter((task) => task.status === 'in-progress'),
      completed: tasks.filter((task) => task.status === 'completed')
    };
  };

  const groupedTasks = groupTasksByStatus(tasks);

  const columns = [
    { id: 'pending-column', title: 'Pending', status: 'pending', color: 'gray' },
    { id: 'in-progress-column', title: 'In Progress', status: 'in-progress', color: 'yellow' },
    { id: 'completed-column', title: 'Completed', status: 'completed', color: 'green' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Task Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {user?.role === 'manager' ? 'Create and manage tasks' : 'View and update your tasks'}
          </p>
        </div>
        {user?.role === 'manager' && (
          <button
            onClick={handleCreateTask}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Task
          </button>
        )}
      </div>

      {showForm && (
        <TaskForm
          task={editingTask}
          onClose={handleFormClose}
          user={user}
        />
      )}

      {showCommentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Change Task Status
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Please provide a comment for this status change <span className="text-red-500">*</span>
              </p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                rows="4"
                placeholder="Enter your comment..."
              />
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setShowCommentModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusChangeSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Change Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div
              key={column.id}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-[500px]"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {column.title}
              </h2>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[400px] ${
                      snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    {groupedTasks[column.status].map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-3 ${
                              snapshot.isDragging ? 'opacity-50' : ''
                            }`}
                          >
                            <TaskCard
                              task={task}
                              onEdit={user?.role === 'manager' ? handleEditTask : null}
                              onDelete={user?.role === 'manager' ? handleDeleteTask : null}
                              onStatusChange={handleStatusChange}
                              canChangeStatus={true}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center space-x-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={!pagination.hasPrev}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!pagination.hasNext}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;

