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
      fuelType: 'ESSENCE', registrationNumber: 'CE-554-MP', vin: 'VF1RFA00000000000',
      acquisitionMileage: 101000, engineCapacity: 1.6, horsePower: 7,
      acquisitionDate: '2020-05-03', expectedDailyRevenue: 12000
    });

    expect(component.form.invalid).toBe(true);
    component.save();
    expect(close).not.toHaveBeenCalled();

    component.form.patchValue({ transmission: 'MANUAL' });
    expect(component.form.valid).toBe(true);
    component.save();
    expect(close).toHaveBeenCalledWith(expect.objectContaining({
      transmission: 'MANUAL', acquisitionMileage: 101000, engineCapacity: 1.6,
      horsePower: 7, acquisitionDate: '2020-05-03', expectedDailyRevenue: 12000,
    }));
    expect(close.mock.calls[0][0]).not.toHaveProperty('currentMileage');
  });

  it('requires a non-negative integer mileage on creation', () => {
    component.form.patchValue({ acquisitionMileage: -1 });
    expect(component.f.acquisitionMileage.invalid).toBe(true);
    component.form.patchValue({ acquisitionMileage: 12.5 });
    expect(component.f.acquisitionMileage.invalid).toBe(true);
    component.form.patchValue({ acquisitionMileage: 0 });
    expect(component.f.acquisitionMileage.valid).toBe(true);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Kilométrage d’acquisition');
  });

  it('rejects invalid optional vehicle specifications', () => {
    component.form.patchValue({ engineCapacity: 0, horsePower: 2.5, expectedDailyRevenue: -1 });
    expect(component.f.engineCapacity.invalid).toBe(true);
    expect(component.f.horsePower.invalid).toBe(true);
    expect(component.f.expectedDailyRevenue.invalid).toBe(true);
  });

  it('does not include current mileage when editing a vehicle', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [VehicleFormComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {
          id: 7, brand: 'Toyota', model: 'Yaris', year: 2004,
          fuelType: 'ESSENCE', transmissionType: 'MANUAL', vin: 'VIN-7',
          registrationNumber: 'CE-554-MP', currentMileage: 101000,
          engineCapacity: 1.6, horsePower: 7,
          acquisitionDate: '2020-05-03', expectedDailyRevenue: 12000,
        } },
        { provide: MatDialogRef, useValue: { close } },
      ],
    }).compileComponents();
    const editFixture = TestBed.createComponent(VehicleFormComponent);
    editFixture.detectChanges();
    const editComponent = editFixture.componentInstance;

    expect(editComponent.form.valid).toBe(true);
    expect(editComponent.form.controls.acquisitionMileage.disabled).toBe(true);
    expect(editComponent.form.value).toMatchObject({
      engineCapacity: 1.6, horsePower: 7,
      acquisitionDate: '2020-05-03', expectedDailyRevenue: 12000,
    });
    expect((editFixture.nativeElement as HTMLElement).textContent).not.toContain('Kilométrage d’acquisition');
    editComponent.save();
    expect(close).toHaveBeenCalledOnce();
    expect(close.mock.calls[0][0]).not.toHaveProperty('acquisitionMileage');
  });

  it('shows labelled transmission and registration fields', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Transmission');
    expect(text).toContain('Numéro d’immatriculation');
    expect(text).toContain('Numéro de châssis');
    expect(text).toContain('Créer le véhicule');
  });
});
