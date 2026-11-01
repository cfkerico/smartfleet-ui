import { createCsv } from './report-csv';

describe('createCsv', () => {
  it('writes a French Excel-compatible CSV with escaped values and raw amounts', () => {
    expect(createCsv(['Véhicule', 'Montant'], [['Toyota "Yaris"; 2026', -35000]]))
      .toBe('\uFEFF"Véhicule";"Montant"\r\n"Toyota ""Yaris""; 2026";"-35000"\r\n');
  });

  it('prevents spreadsheet formulas in text while preserving negative numeric amounts', () => {
    expect(createCsv(['Véhicule', 'Écart'], [['=1+1', -5000]]))
      .toContain('"\'=1+1";"-5000"');
  });
});
