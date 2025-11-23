'use client';

import { useState, useEffect } from 'react';
import { TipReport, TipRow } from '@/types/tips';

interface ReportEditorProps {
  initialReport: TipReport & { id?: string };
  onNext: (report: TipReport & { id?: string }) => void;
  onCancel: () => void;
}

export default function ReportEditor({ initialReport, onNext, onCancel }: ReportEditorProps) {
  const [report, setReport] = useState<TipReport & { id?: string }>(initialReport);
  const [sumOfRows, setSumOfRows] = useState(0);
  const [hasMismatch, setHasMismatch] = useState(false);

  useEffect(() => {
    const sum = report.rows.reduce((acc, row) => acc + row.tippableHours, 0);
    setSumOfRows(parseFloat(sum.toFixed(2)));
    setHasMismatch(Math.abs(sum - report.totalTippableHoursReported) > 0.05);
  }, [report.rows, report.totalTippableHoursReported]);

  const updateHeaderField = (field: keyof TipReport, value: string) => {
    setReport(prev => ({ ...prev, [field]: value }));
  };

  const updateRow = (index: number, field: keyof TipRow, value: string | number) => {
    setReport(prev => ({
      ...prev,
      rows: prev.rows.map((row, i) =>
        i === index ? { ...row, [field]: field === 'tippableHours' ? parseFloat(value as string) || 0 : value } : row
      ),
    }));
  };

  const addRow = () => {
    setReport(prev => ({
      ...prev,
      rows: [...prev.rows, { homeStore: report.storeNumber, partnerName: '', partnerNumber: '', tippableHours: 0 }],
    }));
  };

  const deleteRow = (index: number) => {
    setReport(prev => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Review & Edit Report</h2>
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-900 text-sm"
        >
          Cancel
        </button>
      </div>

      {/* Header Fields */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-lg text-gray-900">Report Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Number</label>
            <input
              type="text"
              value={report.storeNumber}
              onChange={e => updateHeaderField('storeNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Executed By</label>
            <input
              type="text"
              value={report.executedBy}
              onChange={e => updateHeaderField('executedBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period Start</label>
            <input
              type="text"
              value={report.timePeriodStart}
              onChange={e => updateHeaderField('timePeriodStart', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period End</label>
            <input
              type="text"
              value={report.timePeriodEnd}
              onChange={e => updateHeaderField('timePeriodEnd', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Executed On</label>
            <input
              type="text"
              value={report.executedOn}
              onChange={e => updateHeaderField('executedOn', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Mismatch Warning */}
      {hasMismatch && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-yellow-800">
              <strong>Mismatch detected:</strong> Sum of row hours ({sumOfRows.toFixed(2)}) does not match report total ({report.totalTippableHoursReported.toFixed(2)}). Please verify the entries.
            </div>
          </div>
        </div>
      )}

      {/* Partner Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Partner Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Partner Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Home Store</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tippable Hours</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {report.rows.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={row.partnerName}
                      onChange={e => updateRow(index, 'partnerName', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={row.partnerNumber}
                      onChange={e => updateRow(index, 'partnerNumber', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={row.homeStore}
                      onChange={e => updateRow(index, 'homeStore', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={row.tippableHours}
                        onChange={e => updateRow(index, 'tippableHours', e.target.value)}
                        className={`w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          row.uncertainFields?.includes('tippableHours') ? 'border-orange-400 bg-orange-50' : 'border-gray-300'
                        }`}
                      />
                      {row.uncertainFields?.includes('tippableHours') && (
                        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center" title="AI uncertain about this value">
                          ?
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteRow(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900">
                  Total of all rows:
                </td>
                <td className="px-4 py-3 font-semibold text-gray-900">
                  {sumOfRows.toFixed(2)} hours
                </td>
                <td></td>
              </tr>
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right font-medium text-gray-700">
                  Reported total:
                </td>
                <td className="px-4 py-3 font-medium text-gray-700">
                  {report.totalTippableHoursReported.toFixed(2)} hours
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <button
            onClick={addRow}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            + Add Row
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={() => onNext(report)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Continue to Calculate Tips
        </button>
      </div>
    </div>
  );
}
