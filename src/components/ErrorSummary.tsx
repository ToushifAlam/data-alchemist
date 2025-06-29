import React from 'react';
import { ValidationError } from '@/lib/validators';

interface ErrorSummaryProps {
  errors: ValidationError[];
}

const ErrorSummary: React.FC<ErrorSummaryProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <div className="my-6 border border-red-400 bg-red-50 rounded-lg p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-red-700 mb-2">Validation Errors</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-red-800">
          <thead className="border-b font-bold bg-red-100">
            <tr>
              <th className="px-4 py-2">Entity</th>
              <th className="px-4 py-2">Row</th>
              <th className="px-4 py-2">Field</th>
              <th className="px-4 py-2">Message</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((error, index) => (
              <tr key={index} className="border-b last:border-0">
                <td className="px-4 py-1 capitalize">{error.entity}</td>
                <td className="px-4 py-1">{error.row + 1}</td>
                <td className="px-4 py-1">{error.field}</td>
                <td className="px-4 py-1">{error.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ErrorSummary;
