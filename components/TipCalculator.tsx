'use client';

import { useState, useEffect } from 'react';
import { TipReport, TipPayout } from '@/types/tips';

interface TipCalculatorProps {
  report: TipReport & { id?: string };
  onCalculate: (totalTips: number, adjustments: number, payouts: TipPayout[]) => void;
  onBack: () => void;
}

export default function TipCalculator({ report, onCalculate, onBack }: TipCalculatorProps) {
  const [totalTips, setTotalTips] = useState('');
  const [adjustments, setAdjustments] = useState('0');
  const [payouts, setPayouts] = useState<TipPayout[]>([]);
  const [hourlyRate, setHourlyRate] = useState(0);

  const totalHours = report.rows.reduce((sum, row) => sum + row.tippableHours, 0);

  useEffect(() => {
    const tips = parseFloat(totalTips) || 0;
    const adj = parseFloat(adjustments) || 0;
    const effectiveTotal = tips + adj;

    if (totalHours > 0) {
      const rate = effectiveTotal / totalHours;
      setHourlyRate(rate);

      const calculatedPayouts = report.rows.map(row => ({
        partnerName: row.partnerName,
        partnerNumber: row.partnerNumber,
        tippableHours: row.tippableHours,
        tipAmount: row.tippableHours * rate,
      }));

      setPayouts(calculatedPayouts);
    } else {
      setHourlyRate(0);
      setPayouts([]);
    }
  }, [totalTips, adjustments, report.rows, totalHours]);

  const handleContinue = () => {
    const tips = parseFloat(totalTips) || 0;
    const adj = parseFloat(adjustments) || 0;
    onCalculate(tips, adj, payouts);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Calculate Tips</h2>
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 text-sm"
        >
          Back
        </button>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
        <h3 className="font-semibold text-lg text-gray-900">Report Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Store Number:</span>
            <span className="ml-2 font-medium">{report.storeNumber}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Hours:</span>
            <span className="ml-2 font-medium">{totalHours.toFixed(2)}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">Period:</span>
            <span className="ml-2 font-medium">{report.timePeriodStart} - {report.timePeriodEnd}</span>
          </div>
        </div>
      </div>

      {/* Tip Input */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-lg text-gray-900">Enter Tip Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total tip amount for this week <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={totalTips}
                onChange={e => setTotalTips(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adjustments (e.g., cash tips, corrections)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={adjustments}
                onChange={e => setAdjustments(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Calculated Rate */}
        {totalTips && parseFloat(totalTips) > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-700 mb-1">Hourly Tip Rate</div>
              <div className="text-3xl font-bold text-blue-600">
                ${hourlyRate.toFixed(2)}/hr
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Payouts */}
      {payouts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-lg text-gray-900">Preview Payouts</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Partner Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tip Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payouts.map((payout, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{payout.partnerName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payout.tippableHours.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">${payout.tipAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">Total</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{totalHours.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ${payouts.reduce((sum, p) => sum + p.tipAmount, 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!totalTips || parseFloat(totalTips) <= 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          View Results
        </button>
      </div>
    </div>
  );
}
