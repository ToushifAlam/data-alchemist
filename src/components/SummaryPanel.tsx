import React from 'react';

type EntityType = 'clients' | 'workers' | 'tasks';

interface SummaryPanelProps {
  dataCounts: Record<EntityType, number>;
  errorCounts: Record<EntityType, number>;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ dataCounts, errorCounts }) => {
  const entities: EntityType[] = ['clients', 'workers', 'tasks'];

  // Check if any data exists to avoid rendering the panel unnecessarily
  const hasData = entities.some((entity) => dataCounts[entity] > 0);

  if (!hasData) return null;

  return (
    <div className="mb-6 p-3 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-sm max-w-2xl w-full mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4"> Data Summary</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {entities.map((entity) => {
          const hasFile = dataCounts[entity] > 0;
          return (
            <div
              key={entity}
              className={`p-2 rounded-md shadow-sm border ${
                hasFile
                  ? 'bg-white border-gray-200'
                  : 'bg-red-50 border-red-300'
              }`}
            >
              <h3 className="capitalize font-semibold text-gray-700 mb-2">
                {entity}
              </h3>
              <p className="text-sm"> Rows: <span className="font-medium">{dataCounts[entity]}</span></p>
              <p className="text-sm"> Errors: <span className="font-medium text-red-600">{errorCounts[entity]}</span></p>
              {!hasFile && (
                <p className="text-xs text-red-500 mt-2">No file uploaded</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SummaryPanel;
