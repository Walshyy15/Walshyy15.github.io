'use client';

import { TipReport, TipPayout } from '@/types/tips';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

interface ResultsViewProps {
  report: TipReport & { id?: string };
  totalTips: number;
  adjustments: number;
  hourlyRate: number;
  payouts: TipPayout[];
  onReset: () => void;
}

export default function ResultsView({ report, totalTips, adjustments, hourlyRate, payouts, onReset }: ResultsViewProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const totalHours = payouts.reduce((sum, p) => sum + p.tippableHours, 0);
  const totalAmount = payouts.reduce((sum, p) => sum + p.tipAmount, 0);

  const handleSave = async () => {
    if (!report.id) {
      setSaveMessage('Error: Report ID missing');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      const { error } = await supabase.from('tip_calculations').insert({
        report_id: report.id,
        total_tips: totalTips,
        adjustments: adjustments,
        hourly_tip_rate: hourlyRate,
        payouts: payouts,
      });

      if (error) throw error;

      setSaveMessage('Calculation saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Failed to save calculation');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    const header = 'Partner Name\tPartner Number\tTippable Hours\tTip Amount\tHourly Rate\tStore Number\n';
    const rows = payouts.map(p =>
      `${p.partnerName}\t${p.partnerNumber}\t${p.tippableHours.toFixed(2)}\t${p.tipAmount.toFixed(2)}\t${hourlyRate.toFixed(2)}\t${report.storeNumber}`
    ).join('\n');

    navigator.clipboard.writeText(header + rows);
    setSaveMessage('Copied to clipboard!');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const downloadCSV = () => {
    const header = 'Partner Name,Partner Number,Tippable Hours,Tip Amount,Hourly Rate,Store Number\n';
    const rows = payouts.map(p =>
      `"${p.partnerName}","${p.partnerNumber}",${p.tippableHours.toFixed(2)},${p.tipAmount.toFixed(2)},${hourlyRate.toFixed(2)},${report.storeNumber}`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tip-distribution-${report.storeNumber}-${report.timePeriodEnd}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Tip Distribution Results</h2>
        <button
          onClick={onReset}
          className="text-gray-600 hover:text-gray-900 text-sm"
        >
          Start New Report
        </button>
      </div>

      {/* Summary Panel */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
        <h3 className="font-semibold text-lg text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600">Store Number</div>
            <div className="text-lg font-semibold text-gray-900">{report.storeNumber}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Hours</div>
            <div className="text-lg font-semibold text-gray-900">{totalHours.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Tips</div>
            <div className="text-lg font-semibold text-gray-900">${(totalTips + adjustments).toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Hourly Rate</div>
            <div className="text-lg font-semibold text-blue-600">${hourlyRate.toFixed(2)}/hr</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="text-sm text-gray-600">Time Period</div>
          <div className="text-sm font-medium text-gray-900">
            {report.timePeriodStart} - {report.timePeriodEnd}
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-lg text-gray-900">Partner Payouts</h3>
          <div className="flex space-x-2">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={downloadCSV}
              className="px-4 py-2 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium"
            >
              Download CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Partner Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Partner Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tippable Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Hourly Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tip Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payouts.map((payout, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{payout.partnerName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payout.partnerNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{payout.tippableHours.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">${hourlyRate.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">${payout.tipAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td colSpan={2} className="px-6 py-4 text-sm font-semibold text-gray-900">Total</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{totalHours.toFixed(2)}</td>
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">${totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {saveMessage && (
            <span className={saveMessage.includes('Error') || saveMessage.includes('Failed') ? 'text-red-600' : 'text-green-600'}>
              {saveMessage}
            </span>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Calculation'}
          </button>
          <button
            onClick={onReset}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Process Another Report
          </button>
        </div>
      </div>
    </div>
  );
}
