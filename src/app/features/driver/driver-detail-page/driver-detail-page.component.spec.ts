import { TestBed } from '@angular/core/testing';
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
  const open = vi.fn(() => ({ afterClosed: () => of(false) }));

  async function create(id: string | null) {
    await TestBed.configureTestingModule({
      imports: [DriverDetailPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(id === null ? {} : { driverId: id }) } } },
        { provide: DriverService, useValue: { getById } },
        { provide: MatDialog, useValue: { open } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(DriverDetailPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    getById.mockReset();
    open.mockClear();
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
