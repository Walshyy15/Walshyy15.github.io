/*
  # Create tip reports and calculations tables

  1. New Tables
    - `tip_reports`
      - `id` (uuid, primary key)
      - `store_number` (text)
      - `time_period_start` (text)
      - `time_period_end` (text)
      - `executed_by` (text)
      - `executed_on` (text)
      - `rows` (jsonb) - array of TipRow objects
      - `total_tippable_hours_reported` (decimal)
      - `created_at` (timestamptz)
      
    - `tip_calculations`
      - `id` (uuid, primary key)
      - `report_id` (uuid, foreign key to tip_reports)
      - `total_tips` (decimal)
      - `adjustments` (decimal)
      - `hourly_tip_rate` (decimal)
      - `payouts` (jsonb) - array of TipPayout objects
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for public access (since no auth is implemented)
    - Note: In production, these should be restricted to authenticated users
*/

CREATE TABLE IF NOT EXISTS tip_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_number text NOT NULL,
  time_period_start text NOT NULL,
  time_period_end text NOT NULL,
  executed_by text NOT NULL,
  executed_on text NOT NULL,
  rows jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_tippable_hours_reported decimal(10, 2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tip_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES tip_reports(id) ON DELETE CASCADE,
  total_tips decimal(10, 2) NOT NULL DEFAULT 0,
  adjustments decimal(10, 2) NOT NULL DEFAULT 0,
  hourly_tip_rate decimal(10, 4) NOT NULL DEFAULT 0,
  payouts jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tip_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to tip_reports"
  ON tip_reports
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access to tip_reports"
  ON tip_reports
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update access to tip_reports"
  ON tip_reports
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to tip_calculations"
  ON tip_calculations
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access to tip_calculations"
  ON tip_calculations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update access to tip_calculations"
  ON tip_calculations
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_tip_reports_created_at ON tip_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tip_calculations_report_id ON tip_calculations(report_id);
