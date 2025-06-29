import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { ValidationError } from '@/lib/validators';

type EntityType = 'clients' | 'workers' | 'tasks';

interface DataTableProps {
  type: EntityType;
  data: any[];
  setData: (type: EntityType, newData: any[]) => void;
  errors?: ValidationError[];
}

const cleanHeader = (header: string) =>
  header.replace(/_+/g, ' ').replace(/^empty$/i, '').trim() || 'Column';

const normalize = (str: string) => str.toLowerCase().replace(/[\s_-]/g, '');

const hasError = (
  errors: ValidationError[] | undefined,
  rowIndex: number,
  field: string,
  entity: string
): boolean => {
  const fieldNorm = normalize(field);
  return !!errors?.some(
    (err) =>
      (err.entity === entity || err.entity === 'cross') &&
      err.row === rowIndex &&
      normalize(err.field) === fieldNorm
  );
};

const getErrorMessage = (
  errors: ValidationError[] | undefined,
  rowIndex: number,
  field: string,
  entity: string
): string | undefined => {
  const fieldNorm = normalize(field);
  return errors?.find(
    (err) =>
      (err.entity === entity || err.entity === 'cross') &&
      err.row === rowIndex &&
      normalize(err.field) === fieldNorm
  )?.message;
};

const DataTable: React.FC<DataTableProps> = ({ type, data, setData, errors = [] }) => {
  if (data.length === 0) return null;

  const [headers, setHeaders] = useState<string[]>(Object.keys(data[0]));

  const syncHeaders = (newData: any[]) => {
    const keys = new Set<string>();
    newData.forEach((row) => Object.keys(row).forEach((k) => keys.add(k)));
    setHeaders(Array.from(keys));
  };

  const handleEdit = (rowIdx: number, field: string, value: string) => {
    const updatedData = [...data];
    updatedData[rowIdx] = { ...updatedData[rowIdx], [field]: value };
    setData(type, updatedData);
  };

  const handleAddRow = () => {
    const emptyRow: Record<string, string> = {};
    headers.forEach((key) => (emptyRow[key] = ''));
    const updatedData = [...data, emptyRow];
    setData(type, updatedData);
  };

  const handleDeleteRow = (rowIdx: number) => {
    const updatedData = data.filter((_, idx) => idx !== rowIdx);
    setData(type, updatedData);
  };

  const handleHeaderContextMenu = (e: React.MouseEvent, header: string) => {
    e.preventDefault();
    const action = prompt(
      `Right-click options for "${header}":
1 - Rename column
2 - Add column to the right
3 - Delete column
Enter option (1/2/3):`
    );

    if (!['1', '2', '3'].includes(action || '')) return;

    const updatedData = [...data];

    if (action === '1') {
      const newName = prompt(`Enter new name for column "${header}":`);
      if (!newName || headers.includes(newName)) return;
      updatedData.forEach((row) => {
        row[newName] = row[header];
        delete row[header];
      });
    }

    if (action === '2') {
      const newCol = prompt(`Enter name of new column to add after "${header}":`);
      if (!newCol || headers.includes(newCol)) return;

      updatedData.forEach((row) => {
        const newRow: Record<string, string> = {};
        Object.keys(row).forEach((key) => {
          newRow[key] = row[key];
          if (key === header) newRow[newCol] = '';
        });
        Object.assign(row, newRow);
      });
    }

    if (action === '3') {
      if (!confirm(`Are you sure you want to delete column "${header}"?`)) return;
      updatedData.forEach((row) => {
        delete row[header];
      });
    }

    setData(type, updatedData);
    syncHeaders(updatedData);
  };

  return (
    <div className="mt-2 mb-4 border rounded-xl shadow-md overflow-x-auto">
      <h3 className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 px-6 py-3 text-lg font-semibold capitalize border-b">
        {type} Data
      </h3>

      <TableContainer component={Paper}>
        <Table size="small" className="min-w-full">
          <TableHead>
            <TableRow className="bg-blue-50">
              {headers.map((header) => (
                <TableCell
                  key={header}
                  onContextMenu={(e) => handleHeaderContextMenu(e, header)}
                  className="text-gray-800 font-bold text-sm whitespace-nowrap sticky top-0 z-10 bg-blue-50 cursor-context-menu"
                  title="Right-click for options"
                >
                  {cleanHeader(header)}
                </TableCell>
              ))}
              <TableCell className="text-gray-800 font-bold text-sm bg-blue-50 sticky top-0 z-10">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row, rowIdx) => (
              <TableRow key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {headers.map((key) => {
                  const isErrored = hasError(errors, rowIdx, key, type);
                  const errorMsg = getErrorMessage(errors, rowIdx, key, type);
                  return (
                    <TableCell
                      key={key}
                      className={`align-top ${isErrored ? 'bg-red-100 border border-red-500' : ''}`}
                    >
                      <Tooltip
                        title={errorMsg || ''}
                        placement="top"
                        arrow
                        disableHoverListener={!isErrored}
                      >
                        <TextField
                          value={row[key] ?? ''}
                          onChange={(e) => handleEdit(rowIdx, key, e.target.value)}
                          size="small"
                          variant="standard"
                          fullWidth
                          error={isErrored}
                        />
                      </Tooltip>
                    </TableCell>
                  );
                })}
                <TableCell>
                  <Tooltip title="Delete Row">
                    <IconButton
                      aria-label="delete"
                      onClick={() => handleDeleteRow(rowIdx)}
                      size="small"
                      className="text-red-600"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div className="flex justify-end px-4 py-2">
        <button
          onClick={handleAddRow}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium text-xs px-3 py-1 rounded shadow-md transition-all duration-200"
        >
          <AddIcon fontSize="small" />
          Add Row
        </button>
      </div>
    </div>
  );
};

export default DataTable;
