import React from 'react';

export interface Assignment {
  clientId: string;
  taskId: string;
  suggestedWorkerIds: string[];
}

interface AssignmentPanelProps {
  assignments: Assignment[];
}

const AssignmentPanel: React.FC<AssignmentPanelProps> = ({ assignments }) => {
  if (assignments.length === 0) return null;

  return (
    <div className="my-6 p-4 bg-white border rounded-lg shadow max-w-3xl mx-auto">
      <h2 className="text-lg font-semibold mb-4 text-center text-gray-800">
        Prioritized Assignment Suggestions
      </h2>
      <ul className="space-y-2 text-sm text-gray-700">
        {assignments.map((a, i) => (
          <li key={i} className="p-2 bg-gray-50 border rounded">
            <strong>Client:</strong> {a.clientId} | <strong>Task:</strong> {a.taskId}
            <br />
            <strong>Suggested Workers:</strong>{' '}
            {a.suggestedWorkerIds.length > 0
              ? a.suggestedWorkerIds.join(', ')
              : 'No suitable worker found'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AssignmentPanel;
