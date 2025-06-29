import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { ValidationError } from '@/lib/validators';

type EntityType = 'clients' | 'workers' | 'tasks';

interface DownloadButtonProps {
  type: EntityType;
  data: any[];
  errors: ValidationError[];
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ type, data, errors }) => {
  const [validOnly, setValidOnly] = useState(false);

  const getFilteredData = () => {
    if (!validOnly) return data;

    const invalidRows = new Set(errors.filter(e => e.entity === type).map(e => e.row));
    return data.filter((_, index) => !invalidRows.has(index));
  };

  const handleDownload = () => {
    const filteredData = getFilteredData();

    if (!filteredData.length) {
      toast.error(validOnly
        ? `No valid ${type} data to download`
        : `No ${type} data to download`);
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, type);
    XLSX.writeFile(workbook, `${type}_data.xlsx`);

    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} data downloaded`);
  };

  return (
    <div className="flex flex-col items-end gap-2 mt-1 mb-14 px-2">
      <label className="text-sm text-gray-700 flex items-center gap-2">
        <input
          type="checkbox"
          checked={validOnly}
          onChange={() => setValidOnly(!validOnly)}
          className="accent-green-600"
        />
        Export only valid rows
      </label>

      <button
        onClick={handleDownload}
        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium text-sm px-4 py-2 rounded-xl shadow-md hover:from-green-600 hover:to-green-700 transition duration-200"
      >
        Download {type.charAt(0).toUpperCase() + type.slice(1)} Data
      </button>
    </div>
  );
};

export default DownloadButton;