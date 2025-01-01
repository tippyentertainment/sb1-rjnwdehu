import React from 'react';

export const ConfigError: React.FC<{ message: string }> = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-red-600 mb-4">Configuration Error</h2>
      <p className="text-gray-700">{message}</p>
      <p className="mt-4 text-sm text-gray-600">
        Please click the "Connect to Supabase" button in the top right corner to set up your database connection.
      </p>
    </div>
  </div>
);