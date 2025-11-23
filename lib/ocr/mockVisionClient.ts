// Mock vision client simulating AI/OCR extraction from image
export async function extractTextFromImage(file: File | Blob): Promise<string> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock OCR text output resembling a typical Tip Distribution Report
  const mockText = `
Tip Distribution Report

Store Number: 69600
Time Period: 2025-01-13 - 2025-01-19
Executed By: SM12345
Executed On: 2025-01-20 08:15:23

Data Disclaimer: This report contains confidential information.

Home Store    Partner Name              Partner Number    Total Tippable Hours
69600         Ailuogwemhe, Jodie O      US37008498       18.48
69600         Anderson, Sarah M         US36955947       22.75
69600         Chen, Michael K           US37012334       15.25
69600         Davis, Jennifer L         US36998765       31.50
69600         Martinez, Carlos R        US37015678       19.00

Total Tippable Hours: 107.98
  `;

  return mockText;
}
