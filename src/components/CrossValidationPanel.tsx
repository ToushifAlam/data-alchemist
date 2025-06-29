import React from 'react';

interface CrossValidationPanelProps {
  issues: string[];
}

const CrossValidationPanel: React.FC<CrossValidationPanelProps> = ({ issues }) => {
  if (issues.length === 0) return null;

  return (
    <div className="my-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg shadow text-yellow-800">
      <h2 className="text-lg font-semibold mb-2">Cross Validation Issues</h2>
      <ul className="list-disc ml-5 space-y-1 text-sm">
        {issues.map((issue, index) => (
          <li key={index}>{issue}</li>
        ))}
      </ul>
    </div>
  );
};

export default CrossValidationPanel;
