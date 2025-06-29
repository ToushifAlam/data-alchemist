import React from 'react';

interface Props {
  rules: any[];
}

const DownloadRulesButton: React.FC<Props> = ({ rules }) => {
  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(rules, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'rules.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!rules.length) return null;

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold px-5 py-2 rounded-xl shadow transition duration-200 text-sm"
    >
      Download Rules JSON
    </button>
  );
};

export default DownloadRulesButton;
