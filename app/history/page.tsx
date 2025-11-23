'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface HistoryReport {
  id: string;
  store_number: string;
  time_period_start: string;
  time_period_end: string;
  created_at: string;
  tip_calculations: Array<{
    id: string;
    total_tips: number;
    adjustments: number;
    hourly_tip_rate: number;
    payouts: any[];
    created_at: string;
  }>;
}

export default function HistoryPage() {
  const [reports, setReports] = useState<HistoryReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<HistoryReport | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tip_reports')
        .select(`
          id,
          store_number,
          time_period_start,
          time_period_end,
          created_at,
          tip_calculations (
            id,
            total_tips,
            adjustments,
            hourly_tip_rate,
            payouts,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReports(data || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const downloadCalculation = (report: HistoryReport, calculation: any) => {
    const header = 'Partner Name,Partner Number,Tippable Hours,Tip Amount,Hourly Rate,Store Number\n';
    const rows = calculation.payouts.map((p: any) =>
      `"${p.partnerName}","${p.partnerNumber}",${p.tippableHours.toFixed(2)},${p.tipAmount.toFixed(2)},${calculation.hourly_tip_rate.toFixed(2)},${report.store_number}`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tip-distribution-${report.store_number}-${report.time_period_end}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Report History</h1>
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Back to Upload
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <div className="mt-4 text-gray-700 font-medium">Loading history...</div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No reports yet</h2>
            <p className="text-gray-600 mb-6">Upload your first tip distribution report to get started</p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Upload Report
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Past Reports</h2>
            <div className="grid gap-4">
              {reports.map(report => (
                <div
                  key={report.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          Store {report.store_number}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Period: {formatDate(report.time_period_start)} - {formatDate(report.time_period_end)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Uploaded: {formatDateTime(report.created_at)}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {selectedReport?.id === report.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>

                    {report.tip_calculations.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Calculations ({report.tip_calculations.length})
                        </h4>
                        <div className="space-y-2">
                          {report.tip_calculations.map(calc => (
                            <div
                              key={calc.id}
                              className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                            >
                              <div className="flex-1">
                                <div className="text-sm text-gray-900">
                                  <span className="font-medium">Total Tips:</span> ${(calc.total_tips + calc.adjustments).toFixed(2)}
                                  {' • '}
                                  <span className="font-medium">Rate:</span> ${calc.hourly_tip_rate.toFixed(2)}/hr
                                  {' • '}
                                  <span className="font-medium">Partners:</span> {calc.payouts.length}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Calculated: {formatDateTime(calc.created_at)}
                                </div>
                              </div>
                              <button
                                onClick={() => downloadCalculation(report, calc)}
                                className="ml-4 px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-800"
                              >
                                Download CSV
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedReport?.id === report.id && report.tip_calculations.length > 0 && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                      <h4 className="font-semibold text-gray-900 mb-4">Latest Calculation Details</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-white border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Partner Name</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Partner Number</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Hours</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Tip Amount</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {report.tip_calculations[0].payouts.map((payout: any, index: number) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-gray-900">{payout.partnerName}</td>
                                <td className="px-4 py-2 text-gray-600">{payout.partnerNumber}</td>
                                <td className="px-4 py-2 text-gray-900">{payout.tippableHours.toFixed(2)}</td>
                                <td className="px-4 py-2 font-medium text-gray-900">${payout.tipAmount.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
