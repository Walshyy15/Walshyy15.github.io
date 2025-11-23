import { NextRequest, NextResponse } from 'next/server';
import { parseTipReportImage } from '@/lib/ocr/parseTipReport';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    const report = await parseTipReportImage(file);

    // Save to Supabase
    const { data, error } = await supabase
      .from('tip_reports')
      .insert({
        store_number: report.storeNumber,
        time_period_start: report.timePeriodStart,
        time_period_end: report.timePeriodEnd,
        executed_by: report.executedBy,
        executed_on: report.executedOn,
        rows: report.rows,
        total_tippable_hours_reported: report.totalTippableHoursReported,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
    }

    return NextResponse.json({ report: { ...report, id: data.id } });
  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json({ error: 'Failed to parse report' }, { status: 500 });
  }
}
