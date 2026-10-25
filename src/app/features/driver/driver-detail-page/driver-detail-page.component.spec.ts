import { TestBed } from '@angular/core/testing';
import { AssignmentApiService } from '../../../core/services/assignment-api.service';
import { VehicleAssignment } from '../../../models/assignment.model';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DriverService } from '../../../core/services/driver.service';
import { Driver } from '../../../models/driver.model';
import { DriverDetailPageComponent } from './driver-detail-page.component';

describe('DriverDetailPageComponent', () => {
  const driver: Driver = {
    id: 7, civilite: 'Mme', nom: 'Dupont', prenom: 'Alice', fullName: 'Alice Dupont',
    email: 'alice@example.com', mobilePhoneNumber: '0600000000', adresse: 'Paris',
    licenseNumber: 'P-123', licenseExpirationDate: '2027-10-24',
    hireDate: '2025-01-01', status: 'ACTIVE', workedDays: 20,
  };
  const getById = vi.fn();
  const findActiveAssignments = vi.fn(() => of([] as VehicleAssignment[]));
  const open = vi.fn(() => ({ afterClosed: () => of(false) }));

  async function create(id: string | null) {
    await TestBed.configureTestingModule({
      imports: [DriverDetailPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(id === null ? {} : { driverId: id }) } } },
        { provide: DriverService, useValue: { getById } },
        { provide: MatDialog, useValue: { open } },
        { provide: AssignmentApiService, useValue: { findActiveAssignments } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(DriverDetailPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    getById.mockReset();
    open.mockReset();
    open.mockReturnValue({ afterClosed: () => of(false) });
    findActiveAssignments.mockReset();
    findActiveAssignments.mockReturnValue(of([]));
  });

  it('loads the driver and links to its document dossier', async () => {
    getById.mockReturnValue(of(driver));
    const fixture = await create('7');
    expect(getById).toHaveBeenCalledExactlyOnceWith(7);
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Alice Dupont');
    expect(fixture.nativeElement.querySelector('a[href="/drivers/7/documents"]')).toBeTruthy();
  });

  it('opens assignment creation with this driver preselected', async () => {
    getById.mockReturnValue(of(driver));
    const fixture = await create('7');
    fixture.componentInstance.openAssignment();
    expect(open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      data: { mode: 'CREATE', preselectedDriver: driver },
    }));
    fixture.componentInstance.driver.set({ ...driver, status: 'INACTIVE' });
    fixture.componentInstance.openAssignment();
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('enables contextual payment only with an active assignment for this driver', async () => {
    getById.mockReturnValue(of(driver));
    findActiveAssignments.mockReturnValue(of([
      { id: 2, driverId: 99, vehicleId: 8 },
      { id: 3, driverId: 7, vehicleId: 9 },
    ] as VehicleAssignment[]));
    const fixture = await create('7');
    const paymentButton = [...fixture.nativeElement.querySelectorAll('button')]
      .find((button: HTMLButtonElement) => button.textContent?.includes('Nouvelle recette'));
    expect(paymentButton.disabled).toBe(false);
    fixture.componentInstance.openPayment();
    expect(open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ data: { driverId: 7 } }));

    fixture.componentInstance.driver.set({ ...driver, status: 'INACTIVE' });
    fixture.componentInstance.openPayment();
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('disables payment when no active assignment matches this driver', async () => {
    getById.mockReturnValue(of(driver));
    findActiveAssignments.mockReturnValue(of([]));
    const fixture = await create('7');
    const paymentButton = [...fixture.nativeElement.querySelectorAll('button')]
      .find((button: HTMLButtonElement) => button.textContent?.includes('Nouvelle recette'));
    expect(paymentButton.disabled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Aucune affectation active');
    fixture.componentInstance.openPayment();
    expect(open).not.toHaveBeenCalled();
  });

  it('distinguishes an assignment loading error from an empty assignment list', async () => {
    getById.mockReturnValue(of(driver));
    findActiveAssignments.mockReturnValue(throwError(() => new Error('network error')));
    const fixture = await create('7');

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent)
      .toContain('Impossible de vérifier les affectations actives');
    expect(fixture.nativeElement.textContent).not.toContain('Aucune affectation active');
  });

  it('keeps an inactive driver and its document history accessible without creation actions', async () => {
    getById.mockReturnValue(of({ ...driver, status: 'INACTIVE' }));
    const fixture = await create('7');
    const buttons = [...fixture.nativeElement.querySelectorAll('button')] as HTMLButtonElement[];

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Alice Dupont');
    expect(fixture.nativeElement.querySelector('.status')?.textContent).toContain('Inactif');
    expect(fixture.nativeElement.querySelector('a[href="/drivers/7/documents"]')).toBeTruthy();
    expect(buttons.find(button => button.textContent?.includes('Nouvelle affectation'))?.disabled).toBe(true);
    expect(buttons.find(button => button.textContent?.includes('Nouvelle recette'))?.disabled).toBe(true);
    expect(findActiveAssignments).not.toHaveBeenCalled();

    fixture.componentInstance.openAssignment();
    fixture.componentInstance.openPayment();
    expect(open).not.toHaveBeenCalled();
  });

  it('reloads the driver after a successful contextual creation', async () => {
    getById.mockReturnValue(of(driver));
    findActiveAssignments.mockReturnValue(of([{ id: 3, driverId: 7, vehicleId: 9 }] as VehicleAssignment[]));
    open.mockReturnValue({ afterClosed: () => of(true) });
    const fixture = await create('7');

    fixture.componentInstance.openAssignment();
    expect(getById).toHaveBeenCalledTimes(2);
    fixture.componentInstance.openPayment();
    expect(getById).toHaveBeenCalledTimes(3);
  });

  it('does not reload the driver after a cancelled dialog', async () => {
    getById.mockReturnValue(of(driver));
    const fixture = await create('7');

    fixture.componentInstance.openAssignment();
    expect(getById).toHaveBeenCalledTimes(1);
  });

  it('rejects an invalid route id without calling the API', async () => {
    const fixture = await create('invalid');
    expect(getById).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Identifiant du chauffeur invalide');
  });

  it('shows an error if the driver cannot be loaded', async () => {
    getById.mockReturnValue(throwError(() => new Error('not found')));
    const fixture = await create('7');
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Impossible de charger');
  });
});
