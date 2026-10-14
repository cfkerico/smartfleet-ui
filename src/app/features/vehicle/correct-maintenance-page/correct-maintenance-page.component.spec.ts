import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { MaintenanceService } from '../../../core/services/maintenance.service';
import { NotificationService } from '../../../core/services/notification.service';
import { VehicleService } from '../../../core/services/vehicle.service';
import { CorrectMaintenancePageComponent } from './correct-maintenance-page.component';

describe('CorrectMaintenancePageComponent', () => {
  const service = {
    findById: vi.fn(), revisions: vi.fn(), vehicleMileageCorrections: vi.fn(),
    correct: vi.fn(), correctVehicleMileage: vi.fn(),
  };
  const vehicles = { getById: vi.fn() };
  const auth = { isAdmin: vi.fn(), getUser: vi.fn() };
  const item = { id: 42, vehicleId: 1, type: 'OIL_CHANGE', status: 'COMPLETED',
    completedDate: '2026-10-10', mileageAtMaintenance: 101000, costAmount: 30000,
    revisionNumber: 0 };

  beforeEach(async () => {
    vi.resetAllMocks();
    vehicles.getById.mockReturnValue(of({ id: 1, brand: 'Toyota', model: 'Yaris',
      registrationNumber: '033830', year: 2004, currentMileage: 101000 }));
    service.findById.mockReturnValue(of(item));
    service.revisions.mockReturnValue(of([]));
    service.vehicleMileageCorrections.mockReturnValue(of([]));
    auth.isAdmin.mockReturnValue(false);
    auth.getUser.mockReturnValue({ sub: 'current-user', name: 'Choupo Martin' });
    await TestBed.configureTestingModule({
      imports: [CorrectMaintenancePageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: {
          paramMap: convertToParamMap({ vehicleId: '1', maintenanceId: '42' }),
        } } },
        { provide: MaintenanceService, useValue: service },
        { provide: VehicleService, useValue: vehicles },
        { provide: AuthService, useValue: auth },
        { provide: NotificationService, useValue: { success: vi.fn() } },
      ],
    }).compileComponents();
  });

  it('shows revisions but hides correction forms for a non administrator', async () => {
    const fixture = TestBed.createComponent(CorrectMaintenancePageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Entretien #42');
    expect(fixture.nativeElement.textContent).toContain('Historique des rectifications');
    expect(fixture.nativeElement.textContent).not.toContain('Rectifier cet entretien');
    expect(service.findById).toHaveBeenCalledWith(42);
  });

  it('submits the current revision and reason for an administrator', async () => {
    auth.isAdmin.mockReturnValue(true);
    service.correct.mockReturnValue(of({ maintenance: { ...item, revisionNumber: 1 },
      mileageReviewRequired: true }));
    const fixture = TestBed.createComponent(CorrectMaintenancePageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance.form.patchValue({ mileageAtMaintenance: 100600,
      reason: 'Erreur de saisie' });
    fixture.componentInstance.submit();
    expect(service.correct).toHaveBeenCalledWith(42, expect.objectContaining({
      expectedRevision: 0, mileageAtMaintenance: 100600, reason: 'Erreur de saisie',
    }));
    expect(fixture.componentInstance.reviewRequired()).toBe(true);
  });

  it('shows the current user name and a short label for another author', async () => {
    service.revisions.mockReturnValue(of([{ revisionNumber: 1,
      correctedAt: '2026-10-15T00:01:00Z', correctedBy: 'current-user', reason: 'Erreur',
      previous: item, corrected: item }]));
    service.vehicleMileageCorrections.mockReturnValue(of([{
      vehicleId: 1, maintenanceId: 42, previousMileage: 101000,
      correctedMileage: 100600, reason: 'Erreur', correctedAt: '2026-10-15T00:02:00Z',
      correctedBy: 'a47044b3-711c-4799-91d7-4169bb74cd0b',
    }]));

    const fixture = TestBed.createComponent(CorrectMaintenancePageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Choupo Martin');
    expect(text).toContain('Utilisateur · bb74cd0b');
    expect(text).not.toContain('a47044b3-711c-4799-91d7-4169bb74cd0b');
    expect(fixture.nativeElement.querySelector('[title="a47044b3-711c-4799-91d7-4169bb74cd0b"]')).toBeTruthy();
  });
});
