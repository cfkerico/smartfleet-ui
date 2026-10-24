import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DriverService } from '../../core/services/driver.service';
import { NotificationService } from '../../core/services/notification.service';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationService } from '../../core/services/confirmation.service';


import { DriverListComponent } from './driver-list.component';

describe('DriverListComponent', () => {
  let component: DriverListComponent;
  let fixture: ComponentFixture<DriverListComponent>;
  const serviceMock = {
    getAll: vi.fn(() => of({ content: [], totalElements: 0 })),
    update: vi.fn(() => of(undefined)),
    delete: vi.fn(() => of(undefined)),
    reactivate: vi.fn(() => of(undefined)),
  };
  const dialogMock = { open: vi.fn() };
  const confirmationMock = { confirm: vi.fn(() => of(true)) };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [DriverListComponent],
      providers: [
        provideRouter([]),
        {
          provide: DriverService,
          useValue: serviceMock,
        },
        { provide: MatDialog, useValue: dialogMock },
        { provide: ConfirmationService, useValue: confirmationMock },
        { provide: NotificationService, useValue: { error: vi.fn(), success: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DriverListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should request the selected server page without local pagination', () => {
    const service = TestBed.inject(DriverService);
    const getAll = vi.spyOn(service, 'getAll');

    component.onPageChange({ pageIndex: 1, pageSize: 10, length: 25 });

    expect(getAll).toHaveBeenCalledWith(1, 10);
    expect(component.drivers.paginator).toBeUndefined();
    expect(component.pageIndex).toBe(1);
    expect(component.pageSize).toBe(10);
  });

  it('should display the shared list layout and empty state', () => {
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.page-header h1')?.textContent?.trim()).toBe('Chauffeurs');
    expect(element.querySelector('.list-search')).toBeTruthy();
    expect(element.querySelector('.table-card .table-scroll')).toBeTruthy();
    expect(element.querySelector('.empty-state')?.textContent).toContain(
      'Aucun élément à afficher.',
    );
  });

  it('should distinguish active and inactive drivers by row and text', () => {
    component.drivers.data = [
      { id: 1, civilite: 'Mr', nom: 'Actif', prenom: 'Jean', email: 'a@test.fr',
        mobilePhoneNumber: '0600000001', adresse: '', workedDays: 20, status: 'ACTIVE' },
      { id: 2, civilite: 'Mme', nom: 'Inactif', prenom: 'Alice', email: 'b@test.fr',
        mobilePhoneNumber: '0600000002', adresse: '', workedDays: 20, status: 'INACTIVE' },
    ] as any;
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.driver-row--active .driver-status')?.textContent?.trim()).toBe('Actif');
    expect(element.querySelector('.driver-row--inactive .driver-status')?.textContent?.trim()).toBe('Inactif');
  });

  it('should update the selected driver once and refresh the list', () => {
    const payload = { nom: 'Dupont' };
    dialogMock.open.mockReturnValue({ afterClosed: () => of(payload) });
    const driver = { id: 10, nom: 'Ancien' } as any;

    component.edit(driver);

    expect(serviceMock.update).toHaveBeenCalledExactlyOnceWith(10, payload);
    expect(serviceMock.getAll).toHaveBeenCalledTimes(2);
  });

  it('should deactivate only after confirmation, then reactivate', () => {
    const driver = { id: 10, fullName: 'Alice Dupont', status: 'ACTIVE' } as any;

    component.delete(driver);
    component.reactivate({ ...driver, status: 'INACTIVE' });

    expect(serviceMock.delete).toHaveBeenCalledExactlyOnceWith(10);
    expect(serviceMock.reactivate).toHaveBeenCalledExactlyOnceWith(10);
    expect(serviceMock.getAll).toHaveBeenCalledTimes(3);
    expect(confirmationMock.confirm).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Désactiver ce chauffeur ?', confirmLabel: 'Désactiver',
    }));
  });

  it('should not deactivate when the confirmation is cancelled', () => {
    confirmationMock.confirm.mockReturnValueOnce(of(false));
    component.delete({ id: 10, fullName: 'Alice Dupont' } as any);
    expect(serviceMock.delete).not.toHaveBeenCalled();
  });
});
