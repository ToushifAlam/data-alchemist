import React from 'react';
import * as XLSX from 'xlsx';

interface DownloadAllButtonProps {
  clients: any[];
  workers: any[];
  tasks: any[];
}

const DownloadAllButton: React.FC<DownloadAllButtonProps> = ({ clients, workers, tasks }) => {
  if (!clients.length || !workers.length || !tasks.length) return null; // Only show when all are present

  const handleDownload = () => {
    const wb = XLSX.utils.book_new();

    const clientSheet = XLSX.utils.json_to_sheet(clients);
    const workerSheet = XLSX.utils.json_to_sheet(workers);
    const taskSheet = XLSX.utils.json_to_sheet(tasks);

    XLSX.utils.book_append_sheet(wb, clientSheet, 'Clients');
    XLSX.utils.book_append_sheet(wb, workerSheet, 'Workers');
    XLSX.utils.book_append_sheet(wb, taskSheet, 'Tasks');

    XLSX.writeFile(wb, 'all_data_export.xlsx');
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold px-5 py-2 rounded-xl shadow transition duration-200 text-sm"
    >
       Download All Data
    </button>
  );
  
};

export default DownloadAllButton;