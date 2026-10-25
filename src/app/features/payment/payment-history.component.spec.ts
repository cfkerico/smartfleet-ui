import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DriverService } from '../../core/services/driver.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { RevenuePaymentApiService } from '../../core/services/revenue-payment-api.service';

import { PaymentHistoryComponent } from './payment-history.component';
import { DriverPayment } from '../../models/payment.model';
import { Driver } from '../../models/driver.model';
import { Vehicle } from '../../models/vehicle';
import { AuthService } from '../../core/auth/auth.service';

describe('PaymentHistoryComponent', () => {
  let component: PaymentHistoryComponent;
  let fixture: ComponentFixture<PaymentHistoryComponent>;
  const driverOptions = [{ id: 1, fullName: 'Jean Dupont', status: 'INACTIVE' }] as Driver[];
  const vehicleOptions = [{ id: 2, label: 'Toyota Yaris', vehicleStatus: 'ASSIGNED' }] as Vehicle[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentHistoryComponent],
      providers: [
        { provide: AuthService, useValue: { isAdmin: () => false } },
        {
          provide: DriverService,
          useValue: { getOptions: () => of(driverOptions) },
        },
        { provide: VehicleService, useValue: { getOptions: () => of(vehicleOptions) } },
        {
          provide: RevenuePaymentApiService,
          useValue: {
            findPayments: () => of({
              content: [], totalElements: 0, page: 0, size: 10,
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentHistoryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('includes inactive drivers and assigned vehicles in historical filters', () => {
    expect(component.drivers.map(driver => driver.id)).toEqual([1]);
    expect(component.vehicles.map(vehicle => vehicle.id)).toEqual([2]);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should display the payment action in the page header with an icon", () => {
    const header: HTMLElement = fixture.nativeElement.querySelector(".page-header");
    expect(header).toBeTruthy();
    expect(header.querySelector("h1")?.textContent).toContain("Recettes journalières");
    const button = header.querySelector("button");
    expect(button?.textContent).toContain("Nouveau versement");
    expect(button?.querySelector("mat-icon")?.textContent).toContain("payments");
  });

  it.each([
    ['VALIDATED', 'Validée', 'validated'],
    ['PARTIAL', 'Partielle', 'partial'],
    ['OVERPAID', 'Surplus versé', 'overpaid'],
    ['UNDER_REVIEW', 'À vérifier', 'under-review'],
    ['CANCELLED', 'Annulée', 'cancelled'],
  ])('should identify a %s payment in the list', (status, label, rowClass) => {
    component.dataSource.data = [{
      id: 1,
      driverFullName: 'Jean Dupont',
      vehicleLabel: 'Toyota Yaris',
      expectedAmount: 10000,
      paidAmount: 10000,
      differenceAmount: 0,
      paymentDate: '2026-10-24',
      status,
    } as DriverPayment];
    fixture.detectChanges();

    const row: HTMLElement | null = fixture.nativeElement.querySelector(`.payment-row--${rowClass}`);
    expect(row).toBeTruthy();
    expect(row?.querySelector('.status-badge')?.textContent?.trim()).toBe(label);
  });
  it('keeps the server total and displays all ten rows when changing page size', () => {
    const payments = Array.from({ length: 10 }, (_, index) => ({
      id: index + 11,
      driverFullName: 'Jean Dupont',
      vehicleLabel: 'Toyota Yaris',
      expectedAmount: 10000,
      paidAmount: 10000,
      differenceAmount: 0,
      paymentDate: '2026-10-24',
      status: 'VALIDATED',
    } as DriverPayment));
    const findPayments = vi.spyOn(TestBed.inject(RevenuePaymentApiService), 'findPayments')
      .mockReturnValue(of({ content: payments, totalElements: 30, totalPages: 3, page: 1, size: 10, last: false }));

    component.pageSize = 5;
    component.onPageChange({ pageIndex: 1, pageSize: 10, length: 30 });
    fixture.detectChanges();

    expect(findPayments).toHaveBeenLastCalledWith(1, 10, expect.any(Object));
    expect(component.totalElements).toBe(30);
    expect(component.dataSource.paginator).toBeUndefined();
    expect(fixture.nativeElement.querySelectorAll('tr.mat-mdc-row')).toHaveLength(10);
  });
  it('labels summary amounts as current-page totals and uses the paid amount', () => {
    component.dataSource.data = [{
      id: 1,
      driverFullName: 'Jean Dupont',
      vehicleLabel: 'Toyota Yaris',
      expectedAmount: 12000,
      paidAmount: 10000,
      differenceAmount: -2000,
      paymentDate: '2026-10-24',
      status: 'PARTIAL',
    } as DriverPayment];
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.summary-card');
    expect(cards[0].textContent).toContain('Versé sur cette page');
    expect(cards[0].querySelector('strong')?.textContent?.trim()).toBe('10000');
    expect(cards[1].textContent).toContain('Écart sur cette page');
  });
});
