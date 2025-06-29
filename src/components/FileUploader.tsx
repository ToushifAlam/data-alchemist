import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

type EntityType = 'clients' | 'workers' | 'tasks';

interface FileUploaderProps {
  onDataParsed: (type: EntityType, data: any[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onDataParsed }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (!file) return;

    setLoading(true);
    setFileName(file.name);
    const fileType = file.name.endsWith('.csv') ? 'csv' : 'xlsx';
    const reader = new FileReader();
    const entity = inferEntityType(file.name);

    reader.onload = (e) => {
      const result = e.target?.result;
      if (!result) return;

      const handleParsedData = (parsedData: any[]) => {
        const cleanedData = parsedData.map((row: any) => {
          const newRow: any = {};
          Object.keys(row).forEach((key) => {
            newRow[key.trim()] = row[key];
          });
          return newRow;
        });

        setPreview(cleanedData.slice(0, 5));
        setLoading(false);
        onDataParsed(entity, cleanedData);

        setTimeout(() => setPreview(null), 2000);
      };

      if (fileType === 'csv') {
        Papa.parse(result as string, {
          header: true,
          skipEmptyLines: true,
          complete: (parsed) => handleParsedData(parsed.data),
        });
      } else {
        const workbook = XLSX.read(result, { type: 'binary' });
        const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
          defval: '',
        });
        handleParsedData(rawData);
      }
    };

    if (fileType === 'csv') reader.readAsText(file);
    else reader.readAsBinaryString(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
    event.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const inferEntityType = (filename: string): EntityType => {
    if (filename.toLowerCase().includes('client')) return 'clients';
    if (filename.toLowerCase().includes('worker')) return 'workers';
    return 'tasks';
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDrag}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      className={`my-6 p-6 border-2 border-dashed rounded-xl text-center transition-all duration-200 ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
    >
      <p className="mb-3 text-sm text-gray-600 font-medium">
        Drag & Drop CSV or Excel file
      </p>
  
      <label
        htmlFor="file-upload"
        className="cursor-pointer inline-block px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium shadow hover:bg-blue-700 transition"
      >
        Browse File
      </label>
      <input
        id="file-upload"
        type="file"
        accept=".csv, .xlsx"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />
  
      {loading && <p className="mt-3 text-sm text-gray-600">⏳ Processing file...</p>}
  
      {preview && (
        <pre className="bg-gray-100 text-left p-3 mt-4 mx-auto max-w-4xl rounded border text-xs overflow-auto">
          {JSON.stringify(preview, null, 2)}
        </pre>
      )}
    </div>
  );
  
  
};

export default FileUploader;
