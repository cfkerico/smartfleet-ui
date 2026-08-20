import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AssignmentApiService } from '../../core/services/assignment-api.service';
import { RevenuePaymentApiService } from '../../core/services/revenue-payment-api.service';

import { PaymentHistoryComponent } from './payment-history.component';

describe('PaymentHistoryComponent', () => {
  let component: PaymentHistoryComponent;
  let fixture: ComponentFixture<PaymentHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentHistoryComponent],
      providers: [
        {
          provide: AssignmentApiService,
          useValue: { findDrivers: () => of([]), findVehicles: () => of([]) },
        },
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
