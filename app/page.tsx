'use client';

import { useState } from 'react';
import UploadZone from '@/components/UploadZone';
import ReportEditor from '@/components/ReportEditor';
import TipCalculator from '@/components/TipCalculator';
import ResultsView from '@/components/ResultsView';
import { TipReport, TipPayout } from '@/types/tips';
import Link from 'next/link';

type Stage = 'upload' | 'edit' | 'calculate' | 'results';

export default function Home() {
  const [stage, setStage] = useState<Stage>('upload');
  const [report, setReport] = useState<TipReport & { id?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [calculation, setCalculation] = useState<{
    totalTips: number;
    adjustments: number;
    hourlyRate: number;
    payouts: TipPayout[];
  } | null>(null);

  const handleUploadStart = () => {
    setIsLoading(true);
    setError('');
  };

  const handleUploadComplete = (parsedReport: TipReport & { id?: string }) => {
    setIsLoading(false);
    setReport(parsedReport);
    setStage('edit');
  };

  const handleUploadError = (errorMessage: string) => {
    setIsLoading(false);
    setError(errorMessage);
  };

  const handleEditNext = (editedReport: TipReport & { id?: string }) => {
    setReport(editedReport);
    setStage('calculate');
  };

  const handleCalculate = (totalTips: number, adjustments: number, payouts: TipPayout[]) => {
    if (!report) return;

    const totalHours = report.rows.reduce((sum, row) => sum + row.tippableHours, 0);
    const hourlyRate = (totalTips + adjustments) / totalHours;

    setCalculation({ totalTips, adjustments, hourlyRate, payouts });
    setStage('results');
  };

  const handleReset = () => {
    setStage('upload');
    setReport(null);
    setCalculation(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Tip Distribution Calculator</h1>
            <Link
              href="/history"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View History
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stage === 'upload' && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Upload a Tip Distribution Report
              </h2>
              <p className="text-gray-600">
                Take or upload a photo of your weekly tip distribution report to automatically calculate individual tip payouts
              </p>
            </div>

            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <div className="mt-4 text-gray-700 font-medium">Analyzing report...</div>
              </div>
            )}

            {!isLoading && (
              <>
                <UploadZone
                  onUploadStart={handleUploadStart}
                  onUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                />

                {error && (
                  <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-red-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div className="text-sm text-red-800">{error}</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {stage === 'edit' && report && (
          <ReportEditor
            initialReport={report}
            onNext={handleEditNext}
            onCancel={handleReset}
          />
        )}

        {stage === 'calculate' && report && (
          <TipCalculator
            report={report}
            onCalculate={handleCalculate}
            onBack={() => setStage('edit')}
          />
        )}

        {stage === 'results' && report && calculation && (
          <ResultsView
            report={report}
            totalTips={calculation.totalTips}
            adjustments={calculation.adjustments}
            hourlyRate={calculation.hourlyRate}
            payouts={calculation.payouts}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}
