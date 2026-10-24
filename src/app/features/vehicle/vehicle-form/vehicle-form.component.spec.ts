import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { VehicleFormComponent } from './vehicle-form.component';

describe('VehicleFormComponent', () => {
  let component: VehicleFormComponent;
  let fixture: ComponentFixture<VehicleFormComponent>;
  const close = vi.fn();

  beforeEach(async () => {
    close.mockClear();
    await TestBed.configureTestingModule({
      imports: [VehicleFormComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: MatDialogRef, useValue: { close } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('requires a transmission before creating a vehicle', () => {
    component.form.patchValue({
      brand: 'Toyota', model: 'Yaris', year: 2004,
      fuelType: 'ESSENCE', registrationNumber: 'CE-554-MP', vin: 'VF1RFA00000000000'
    });

    expect(component.form.invalid).toBe(true);
    component.save();
    expect(close).not.toHaveBeenCalled();

    component.form.patchValue({ transmission: 'MANUAL' });
    expect(component.form.valid).toBe(true);
    component.save();
    expect(close).toHaveBeenCalledWith(expect.objectContaining({ transmission: 'MANUAL' }));
  });

  it('shows labelled transmission and registration fields', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Transmission');
    expect(text).toContain('Numéro d’immatriculation');
    expect(text).toContain('Numéro de châssis');
    expect(text).toContain('Créer le véhicule');
  });
});
