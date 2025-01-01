import React from 'react';
import { Link } from 'react-router-dom';
import { useSprintStore } from '../stores/sprintStore';

export const SprintList: React.FC = () => {
  const { sprints, loading, error, fetchSprints } = useSprintStore();

  React.useEffect(() => {
    fetchSprints();
  }, [fetchSprints]);

  if (loading) return <div>Loading sprints...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Sprints</h2>
      <div className="grid gap-4">
        {sprints.map((sprint) => (
          <Link
            key={sprint.id}
            to={`/sprint/${sprint.id}`}
            className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-semibold">{sprint.name}</h3>
            <div className="mt-2 text-gray-600">
              <p>Start: {new Date(sprint.start_date).toLocaleDateString()}</p>
              <p>End: {new Date(sprint.end_date).toLocaleDateString()}</p>
              <span className={`mt-2 inline-block px-2 py-1 rounded text-sm ${
                sprint.status === 'active' ? 'bg-green-100 text-green-800' :
                sprint.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {sprint.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};