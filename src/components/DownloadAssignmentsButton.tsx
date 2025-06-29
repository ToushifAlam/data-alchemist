import React from 'react';
import { saveAs } from 'file-saver';

interface Assignment {
  clientId: string;
  taskId: string;
  suggestedWorkerIds: string[];
}

interface Props {
  assignments: Assignment[];
}

const DownloadAssignmentsButton: React.FC<Props> = ({ assignments }) => {
  const handleDownload = () => {
    const csv = [
      ['Client ID', 'Task ID', 'Suggested Worker IDs'],
      ...assignments.map(a => [
        a.clientId,
        a.taskId,
        a.suggestedWorkerIds.join(', ')
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'assignments.csv');
  };

  return (
    <button
      onClick={handleDownload}
      className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-all"
    >
      Download Assignments CSV
    </button>
  );
};

export default DownloadAssignmentsButton;
