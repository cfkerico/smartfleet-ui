import {TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {of} from 'rxjs';
import {VehicleService} from '../../../core/services/vehicle.service';
import {NotificationService} from '../../../core/services/notification.service';
import {AcquisitionPriceDialogComponent} from './acquisition-price-dialog.component';

describe('AcquisitionPriceDialogComponent', () => {
  const correctAcquisitionPrice = vi.fn(() => of({}));
  const close = vi.fn();
  const success = vi.fn();

  beforeEach(async () => {
    correctAcquisitionPrice.mockClear();
    close.mockClear();
    success.mockClear();
    await TestBed.configureTestingModule({
      imports: [AcquisitionPriceDialogComponent],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: {
          vehicleId: 7, vehicleLabel: 'Toyota Yaris', currentPrice: 2000000,
        }},
        {provide: MatDialogRef, useValue: {close}},
        {provide: VehicleService, useValue: {correctAcquisitionPrice}},
        {provide: NotificationService, useValue: {success, error: vi.fn()}},
      ],
    }).compileComponents();
  });

  it('requires a different price and a reason before sending', () => {
    const component = TestBed.createComponent(AcquisitionPriceDialogComponent).componentInstance;
    component.form.patchValue({correctedPrice: 2000000, reason: 'Erreur de saisie'});
    component.submit();
    expect(correctAcquisitionPrice).not.toHaveBeenCalled();
    component.form.patchValue({correctedPrice: 2500000, reason: '  '});
    component.submit();
    expect(correctAcquisitionPrice).not.toHaveBeenCalled();
  });

  it('sends the correction and closes after success', () => {
    const component = TestBed.createComponent(AcquisitionPriceDialogComponent).componentInstance;
    component.form.patchValue({correctedPrice: 2500000, reason: ' Erreur de saisie '});
    component.submit();
    expect(correctAcquisitionPrice).toHaveBeenCalledWith(7, 2500000, 'Erreur de saisie');
    expect(success).toHaveBeenCalled();
    expect(close).toHaveBeenCalledWith(true);
  });
});
