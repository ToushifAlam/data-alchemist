import React from 'react';

interface DownloadJsonButtonProps {
  clients: any[];
  workers: any[];
  tasks: any[];
}

const DownloadJsonButton: React.FC<DownloadJsonButtonProps> = ({
  clients,
  workers,
  tasks,
}) => {
  const handleDownload = () => {
    const output = { clients, workers, tasks };
    const blob = new Blob([JSON.stringify(output, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'validated_data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold px-5 py-2 rounded-xl shadow transition duration-200 text-sm"
    >
       Download Final JSON
    </button>
  );
};

export default DownloadJsonButton;
