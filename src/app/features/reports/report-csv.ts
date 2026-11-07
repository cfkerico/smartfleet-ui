import { FleetOperationsPage } from '../../models/fleet-operations.model';
import { MonthlyOperationsSeries } from '../../models/monthly-operations.model';
import { ExpenseCategoryReport } from '../../models/expense-category-report.model';

export function createCsv(headers: string[], rows: (string | number)[][]): string {
  const quote = (value: string | number) => {
    const safe = typeof value === 'string' && /^[\s]*[=+@-]/.test(value) ? `'${value}` : String(value);
    return `"${safe.replaceAll('"', '""')}"`;
  };
  return '\uFEFF' + [headers, ...rows].map(row => row.map(quote).join(';')).join('\r\n') + '\r\n';
}

export function monthlyReportCsv(data: MonthlyOperationsSeries): string {
  return createCsv(['Mois', 'Recettes enregistrées', 'Dépenses décaissées', "Écart d'exploitation"],
    data.months.map(item => [item.month, item.recordedRevenue, item.disbursedExpenses,
      item.operatingDifference]));
}

export function fleetPageCsv(data: FleetOperationsPage, statusLabel: (status: string) => string): string {
  return createCsv(['ID véhicule', 'Véhicule', 'État', 'Recettes enregistrées', 'Dépenses décaissées',
    "Écart d'exploitation"], data.content.map(item => [item.vehicleId, item.vehicleLabel,
    statusLabel(item.vehicleStatus), item.recordedRevenue, item.disbursedExpenses,
    item.operatingDifference]));
}

export function expenseCategoryReportCsv(
  data: ExpenseCategoryReport, categoryLabel: (category: string) => string,
): string {
  return createCsv(['Catégorie', 'Décaissements'], [
    ...data.categories.map(item => [categoryLabel(item.category), item.disbursedAmount]),
    ['Total décaissé', data.totalDisbursed],
  ]);
}

export function downloadCsv(filename: string, content: string): void {
  downloadBlob(filename, new Blob([content], { type: 'text/csv;charset=utf-8' }));
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
