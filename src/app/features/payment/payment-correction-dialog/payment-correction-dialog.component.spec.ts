import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RevenuePaymentApiService } from '../../../core/services/revenue-payment-api.service';
import { DriverPayment, DriverPaymentCorrection } from '../../../models/payment.model';
import { PaymentCorrectionDialogComponent } from './payment-correction-dialog.component';

describe('PaymentCorrectionDialogComponent', () => {
  const payment = {
    id: 7, driverFullName: 'Jean Dupont', vehicleLabel: 'Toyota Yaris',
    expectedAmount: 10000, paidAmount: 8000, paymentDate: '2026-10-25',
  } as DriverPayment;
  const correctPayment = vi.fn(() => of(void 0));
  const close = vi.fn();
  const isAdmin = vi.fn(() => true);

  beforeEach(async () => {
    correctPayment.mockClear();
    close.mockClear();
    isAdmin.mockReturnValue(true);
    await TestBed.configureTestingModule({
      imports: [PaymentCorrectionDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: payment },
        { provide: MatDialogRef, useValue: { close } },
        { provide: AuthService, useValue: { isAdmin } },
        { provide: RevenuePaymentApiService, useValue: {
          getCorrections: () => of([]), correctPayment,
        } },
        { provide: NotificationService, useValue: { success: () => undefined, error: () => undefined } },
      ],
    }).compileComponents();
  });

  it('shows history and submits an admin correction with a reason', async () => {
    const fixture = TestBed.createComponent(PaymentCorrectionDialogComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance;
    expect(fixture.nativeElement.textContent).toContain('Aucune correction enregistrée');
    component.form.setValue({ correctedAmount: 12000, reason: 'Erreur de saisie' });
    component.submit();
    expect(correctPayment).toHaveBeenCalledWith(7, {
      correctedAmount: 12000, reason: 'Erreur de saisie',
    });
    expect(close).toHaveBeenCalledWith(true);
  });

  it('keeps correction unavailable to a non-admin', async () => {
    isAdmin.mockReturnValue(false);
    const fixture = TestBed.createComponent(PaymentCorrectionDialogComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance.form.setValue({ correctedAmount: 12000, reason: 'Motif' });
    fixture.componentInstance.submit();
    expect(fixture.nativeElement.textContent).not.toContain('Enregistrer la correction');
    expect(correctPayment).not.toHaveBeenCalled();
  });
  it('shows asynchronously loaded history to a non-admin without another click', async () => {
    isAdmin.mockReturnValue(false);
    const history$ = new Subject<DriverPaymentCorrection[]>();
    vi.spyOn(TestBed.inject(RevenuePaymentApiService), 'getCorrections').mockReturnValue(history$);
    const fixture = TestBed.createComponent(PaymentCorrectionDialogComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Chargement de l'historique");

    history$.next([{
      id: 1, paymentId: 7, previousAmount: 8000, correctedAmount: 10000,
      reason: 'Erreur de saisie', correctedBy: 'admin', correctedAt: '2026-10-25T19:03:00Z',
    }]);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('8000');
    expect(fixture.nativeElement.textContent).toContain('Erreur de saisie');
    expect(fixture.nativeElement.textContent).not.toContain("Chargement de l'historique");
    expect(fixture.nativeElement.textContent).not.toContain('Enregistrer la correction');
  });
});
