import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AnalyticsService } from '../../core/services/analytics.service';
import { FleetOperationsPage } from '../../models/fleet-operations.model';
import { MonthlyOperationsSeries } from '../../models/monthly-operations.model';
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
  const getMonthlyOperations = vi.fn().mockReturnValue(of(monthly));
  const getFleetOperations = vi.fn().mockReturnValue(of(fleet));

  beforeEach(async () => {
    getMonthlyOperations.mockClear();
    getFleetOperations.mockClear();
    await TestBed.configureTestingModule({
      imports: [OperationsReportsComponent],
      providers: [
        provideRouter([]),
        { provide: AnalyticsService, useValue: { getMonthlyOperations, getFleetOperations } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OperationsReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('loads both reports and shows zero months and a vehicle link', () => {
    expect(getMonthlyOperations).toHaveBeenCalledWith(undefined, undefined);
    expect(getFleetOperations).toHaveBeenCalledWith(0, 10, undefined, undefined);
    expect(fixture.nativeElement.textContent).toContain('2026-08');
    expect(fixture.nativeElement.textContent).toContain('542036 - Toyota Corolla');
    expect(fixture.nativeElement.querySelector('a[href="/vehicles/7"]')).not.toBeNull();
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
});
