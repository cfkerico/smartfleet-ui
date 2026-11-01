import { createCsv, fleetPageCsv, monthlyReportCsv } from './report-csv';

describe('createCsv', () => {
  it('writes a French Excel-compatible CSV with escaped values and raw amounts', () => {
    expect(createCsv(['Véhicule', 'Montant'], [['Toyota "Yaris"; 2026', -35000]]))
      .toBe('\uFEFF"Véhicule";"Montant"\r\n"Toyota ""Yaris""; 2026";"-35000"\r\n');
  });

  it('prevents spreadsheet formulas in text while preserving negative numeric amounts', () => {
    expect(createCsv(['Véhicule', 'Écart'], [['=1+1', -5000]]))
      .toContain('"\'=1+1";"-5000"');
  });

  it('exports every displayed month, including a month without movements', () => {
    const csv = monthlyReportCsv({
      fromMonth: '2026-07', toMonth: '2026-08',
      months: [
        { month: '2026-07', recordedRevenue: 170000, disbursedExpenses: 205000, operatingDifference: -35000 },
        { month: '2026-08', recordedRevenue: 0, disbursedExpenses: 0, operatingDifference: 0 },
      ],
    });
    expect(csv).toContain('"2026-07";"170000";"205000";"-35000"');
    expect(csv).toContain('"2026-08";"0";"0";"0"');
    expect(csv.split('\r\n')).toHaveLength(4);
  });

  it('exports only the visible vehicle page, not the server total', () => {
    const csv = fleetPageCsv({
      fromInclusive: '2026-07-01', toInclusive: '2026-07-31',
      content: [{ vehicleId: 7, vehicleLabel: '542036 - Toyota Corolla', vehicleStatus: 'AVAILABLE',
        recordedRevenue: 80000, disbursedExpenses: 50000, operatingDifference: 30000 }],
      page: 0, size: 1, totalElements: 12, totalPages: 12, last: false,
    }, status => status === 'AVAILABLE' ? 'Disponible' : status);
    expect(csv).toContain('"7";"542036 - Toyota Corolla";"Disponible";"80000";"50000";"30000"');
    expect(csv.split('\r\n')).toHaveLength(3);
  });
});
