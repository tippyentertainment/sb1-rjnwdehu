import React from 'react';
import { Clipboard, Clock, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import type { Task } from '@/types/task';
import type { User } from '@/types/task';

interface TaskAssignmentEmailProps {
  task: Task;
  assignedBy?: User;
  assignedTo: User;
}

const TaskAssignmentEmail: React.FC<TaskAssignmentEmailProps> = ({
  task,
  assignedBy,
  assignedTo
}) => {
  // Format date to be more readable
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  console.log('Rendering task assignment email for:', {
    taskId: task.id,
    assignedTo: assignedTo?.id,
    assignedBy: assignedBy?.id
  });

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="font-bold text-2xl">
            <span className="text-gray-900">tasking.</span>
            <span className="text-orange-500">tech</span>
            <span className="text-gray-900">®</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Clipboard className="text-orange-500 w-6 h-6 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">New Task Assigned</h1>
          </div>
          
          <p className="text-gray-800 mb-4">
            Hi {assignedTo?.full_name || assignedTo?.username || 'there'},
          </p>
          
          <p className="text-gray-700 mb-6">
            You have been assigned a new task
            {assignedBy ? ` by ${assignedBy.full_name || assignedBy.username}` : ''}.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="font-semibold text-lg text-gray-900 mb-3">{task.title}</h2>
            <div className="space-y-3">
              {task.end_date && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-gray-700">Due: {formatDate(task.end_date)}</span>
                </div>
              )}
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-gray-700">Status: {task.status}</span>
              </div>
              <div className="flex items-center">
                <FileText className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-gray-700">Task ID: {task.id}</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button className="bg-orange-500 text-white px-6 py-2 rounded-lg flex items-center justify-center mx-auto hover:bg-orange-600 transition-colors">
              View Task Details
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <footer className="text-center text-gray-600 text-sm">
        <p className="mb-2">
          Update notification preferences in your{' '}
          <a href="#settings" className="text-orange-500 hover:underline">
            account settings
          </a>
        </p>
        <p>© 2024 tasking.tech® | All rights reserved</p>
      </footer>
    </div>
  );
};

export default TaskAssignmentEmail;