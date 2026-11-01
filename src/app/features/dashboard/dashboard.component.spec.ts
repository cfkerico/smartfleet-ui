import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { DashboardAnalytics } from '../../models/dashboard-analytics.model';
import { FleetOperationsPage } from '../../models/fleet-operations.model';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  const result: DashboardAnalytics = {
    fromInclusive: '2026-07-01', toInclusive: '2026-07-31',
    recordedRevenue: 170000, disbursedExpenses: 205000, operatingDifference: -35000,
    activeDrivers: 7, operationalVehicles: 7,
  };
  const getDashboard = vi.fn().mockReturnValue(of(result));
  const fleetResult: FleetOperationsPage = {
    fromInclusive: '2026-07-01', toInclusive: '2026-07-31',
    content: [
      { vehicleId: 7, vehicleLabel: '542036 - Toyota Corolla', vehicleStatus: 'AVAILABLE', recordedRevenue: 80000, disbursedExpenses: 50000, operatingDifference: 30000 },
      { vehicleId: 6, vehicleLabel: '065389 - Toyota Yaris', vehicleStatus: 'AVAILABLE', recordedRevenue: 0, disbursedExpenses: 60000, operatingDifference: -60000 },
    ],
    page: 0, size: 5, totalElements: 8, totalPages: 2, last: false,
  };
  const getFleetOperations = vi.fn().mockReturnValue(of(fleetResult));
  const auth = { isAdmin: vi.fn().mockReturnValue(true), hasRole: vi.fn().mockReturnValue(false) };

  beforeEach(async () => {
    getDashboard.mockClear();
    getFleetOperations.mockClear();
    auth.isAdmin.mockReturnValue(true);
    auth.hasRole.mockReturnValue(false);
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AnalyticsService, useValue: { getDashboard, getFleetOperations } },
        { provide: AuthService, useValue: auth },
        provideRouter([]),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('loads the company month and displays the signed operating difference', () => {
    expect(getDashboard).toHaveBeenCalledWith(undefined, undefined);
    expect(getFleetOperations).toHaveBeenCalledWith(0, 5, undefined, undefined);
    expect(component.period.getRawValue()).toEqual({ from: '2026-07-01', to: '2026-07-31' });
    expect(fixture.nativeElement.textContent).toContain('170');
    expect(fixture.nativeElement.textContent).toContain('205');
    expect(fixture.nativeElement.textContent).toContain('-35');
    expect(fixture.nativeElement.textContent).not.toContain('Average IA Score');
    expect(fixture.nativeElement.textContent).toContain('542036 - Toyota Corolla');
    expect(fixture.nativeElement.textContent).toContain('-60');
    expect(fixture.nativeElement.querySelector('a[href="/vehicles/7"]')).not.toBeNull();
  });

  it('requests the selected period without browser-local date conversion', () => {
    component.period.setValue({ from: '2026-06-01', to: '2026-06-30' });
    component.applyPeriod(new Event('submit'));
    expect(getDashboard).toHaveBeenLastCalledWith('2026-06-01', '2026-06-30');
    expect(getFleetOperations).toHaveBeenLastCalledWith(0, 5, '2026-06-01', '2026-06-30');
  });

  it('requests the selected fleet page from the server', () => {
    component.onPageChange({ pageIndex: 1, pageSize: 5, length: 8 });
    expect(getFleetOperations).toHaveBeenLastCalledWith(1, 5, '2026-07-01', '2026-07-31');
  });

  it('does not request an inverted period', () => {
    component.period.setValue({ from: '2026-08-01', to: '2026-07-31' });
    component.applyPeriod(new Event('submit'));
    expect(getDashboard).toHaveBeenCalledTimes(1);
    expect(getFleetOperations).toHaveBeenCalledTimes(1);
  });

  it('hides financial cards from other roles', () => {
    fixture.destroy();
    auth.isAdmin.mockReturnValue(false);
    auth.hasRole.mockReturnValue(false);
    getDashboard.mockClear();
    getFleetOperations.mockClear();
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    expect(getDashboard).not.toHaveBeenCalled();
    expect(getFleetOperations).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).not.toContain('Recettes enregistrées');
    expect(fixture.nativeElement.querySelector('app-alerts-widget')).toBeNull();
  });
});
