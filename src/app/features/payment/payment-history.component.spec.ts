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
});
