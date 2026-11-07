import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AnalyticsService } from '../../core/services/analytics.service';
import { NotificationService } from '../../core/services/notification.service';
import { FleetOperationsPage } from '../../models/fleet-operations.model';
import { MonthlyOperationsSeries } from '../../models/monthly-operations.model';
import { ExpenseCategoryReport } from '../../models/expense-category-report.model';
import { OperationsReportsComponent } from './operations-reports.component';

describe('OperationsReportsComponent', () => {
  let fixture: ComponentFixture<OperationsReportsComponent>;
  let component: OperationsReportsComponent;
  const monthly: MonthlyOperationsSeries = {
    fromMonth: '2026-07', toMonth: '2026-08',
    months: [
      { month: '2026-07', recordedRevenue: 170000, disbursedExpenses: 205000, operatingDifference: -35000 },
      { month: '2026-08', recordedRevenue: 0, disbursedExpenses: 0, operatingDifference: 0 },
    ],
  };
  const fleet: FleetOperationsPage = {
    fromInclusive: '2026-07-01', toInclusive: '2026-07-31',
    content: [{ vehicleId: 7, vehicleLabel: '542036 - Toyota Corolla', vehicleStatus: 'AVAILABLE',
      recordedRevenue: 80000, disbursedExpenses: 50000, operatingDifference: 30000 }],
    page: 0, size: 10, totalElements: 12, totalPages: 2, last: false,
  };
  const categories: ExpenseCategoryReport = {
    fromInclusive: '2026-07-01', toInclusive: '2026-07-31', totalDisbursed: 50000,
    categories: [
      { category: 'FUEL', disbursedAmount: 30000 },
      { category: 'REPAIR', disbursedAmount: 20000 },
      { category: 'INSURANCE', disbursedAmount: 0 },
    ],
  };
  const getMonthlyOperations = vi.fn().mockReturnValue(of(monthly));
  const getFleetOperations = vi.fn().mockReturnValue(of(fleet));
  const exportFleetOperations = vi.fn().mockReturnValue(of(new Blob(['csv'])));
  const getExpenseCategoryReport = vi.fn().mockReturnValue(of(categories));
  const notification = { success: vi.fn(), error: vi.fn() };

  beforeEach(async () => {
    getMonthlyOperations.mockClear();
    getFleetOperations.mockClear();
    exportFleetOperations.mockClear();
    getExpenseCategoryReport.mockClear();
    notification.success.mockClear();
    notification.error.mockClear();
    await TestBed.configureTestingModule({
      imports: [OperationsReportsComponent],
      providers: [
        provideRouter([]),
        { provide: AnalyticsService, useValue: { getMonthlyOperations, getFleetOperations,
          exportFleetOperations, getExpenseCategoryReport } },
        { provide: NotificationService, useValue: notification },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OperationsReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('loads all reports and shows zero months, categories and a vehicle link', () => {
    expect(getMonthlyOperations).toHaveBeenCalledWith(undefined, undefined);
    expect(getFleetOperations).toHaveBeenCalledWith(0, 10, undefined, undefined);
    expect(getExpenseCategoryReport).toHaveBeenCalledWith(undefined, undefined);
    expect(fixture.nativeElement.textContent).toContain('2026-08');
    expect(fixture.nativeElement.textContent).toContain('542036 - Toyota Corolla');
    expect(fixture.nativeElement.textContent).toContain('Assurance');
    expect(fixture.nativeElement.querySelector('a[href="/vehicles/7"]')).not.toBeNull();
  });

  it('filters actual disbursements by an independent period', () => {
    component.expenseCategoryPeriod.setValue({ from: '2026-10-01', to: '2026-10-31' });
    component.applyExpenseCategoryPeriod(new Event('submit'));
    expect(getExpenseCategoryReport).toHaveBeenLastCalledWith('2026-10-01', '2026-10-31');
    component.expenseCategoryPeriod.setValue({ from: '2026-11-01', to: '2026-10-31' });
    component.applyExpenseCategoryPeriod(new Event('submit'));
    expect(getExpenseCategoryReport).toHaveBeenCalledTimes(2);
  });

  it('exports the displayed expense categories for the displayed period', () => {
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn().mockReturnValue('blob:test') });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const button = [...fixture.nativeElement.querySelectorAll('button')]
      .find((element: HTMLButtonElement) => element.textContent.includes('Exporter les catégories affichées'));
    expect(button).toBeDefined();
    expect(button.disabled).toBe(false);
    button.click();

    expect(click).toHaveBeenCalledOnce();
    expect(getExpenseCategoryReport).toHaveBeenCalledTimes(1);
    click.mockRestore();
  });

  it('filters months and rejects a period longer than 24 months', () => {
    component.monthlyPeriod.setValue({ fromMonth: '2026-07', toMonth: '2026-10' });
    component.applyMonthlyPeriod(new Event('submit'));
    expect(getMonthlyOperations).toHaveBeenLastCalledWith('2026-07', '2026-10');
    component.monthlyPeriod.setValue({ fromMonth: '2024-01', toMonth: '2026-01' });
    component.applyMonthlyPeriod(new Event('submit'));
    expect(getMonthlyOperations).toHaveBeenCalledTimes(2);
  });

  it('resets the fleet page when changing period and requests server pages', () => {
    component.changeFleetPage({ pageIndex: 1, pageSize: 10, length: 12 });
    expect(getFleetOperations).toHaveBeenLastCalledWith(1, 10, '2026-07-01', '2026-07-31');
    component.fleetPeriod.setValue({ from: '2026-06-01', to: '2026-06-30' });
    component.applyFleetPeriod(new Event('submit'));
    expect(component.pageIndex()).toBe(0);
    expect(getFleetOperations).toHaveBeenLastCalledWith(0, 10, '2026-06-01', '2026-06-30');
  });

  it('requests the complete fleet export for the displayed period', () => {
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn().mockReturnValue('blob:test') });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    component.exportAllVehicles();

    expect(exportFleetOperations).toHaveBeenCalledWith('2026-07-01', '2026-07-31');
    expect(click).toHaveBeenCalledOnce();
    expect(notification.success).toHaveBeenCalledOnce();
    click.mockRestore();
  });
});
