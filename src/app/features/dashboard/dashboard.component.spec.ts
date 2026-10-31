import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../../core/auth/auth.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { DashboardAnalytics } from '../../models/dashboard-analytics.model';
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
  const auth = { isAdmin: vi.fn().mockReturnValue(true), hasRole: vi.fn().mockReturnValue(false) };

  beforeEach(async () => {
    getDashboard.mockClear();
    auth.isAdmin.mockReturnValue(true);
    auth.hasRole.mockReturnValue(false);
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AnalyticsService, useValue: { getDashboard } },
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('loads the company month and displays the signed operating difference', () => {
    expect(getDashboard).toHaveBeenCalledWith(undefined, undefined);
    expect(component.period.getRawValue()).toEqual({ from: '2026-07-01', to: '2026-07-31' });
    expect(fixture.nativeElement.textContent).toContain('170');
    expect(fixture.nativeElement.textContent).toContain('205');
    expect(fixture.nativeElement.textContent).toContain('-35');
    expect(fixture.nativeElement.textContent).not.toContain('Average IA Score');
  });

  it('requests the selected period without browser-local date conversion', () => {
    component.period.setValue({ from: '2026-06-01', to: '2026-06-30' });
    component.applyPeriod(new Event('submit'));
    expect(getDashboard).toHaveBeenLastCalledWith('2026-06-01', '2026-06-30');
  });

  it('does not request an inverted period', () => {
    component.period.setValue({ from: '2026-08-01', to: '2026-07-31' });
    component.applyPeriod(new Event('submit'));
    expect(getDashboard).toHaveBeenCalledTimes(1);
  });

  it('hides financial cards from other roles', () => {
    fixture.destroy();
    auth.isAdmin.mockReturnValue(false);
    auth.hasRole.mockReturnValue(false);
    getDashboard.mockClear();
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    expect(getDashboard).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).not.toContain('Recettes enregistrées');
    expect(fixture.nativeElement.querySelector('app-alerts-widget')).toBeNull();
  });
});
