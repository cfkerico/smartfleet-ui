import { ComponentFixture, TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DriverFormComponent } from './driver-form.component';

describe('DriverFormComponent', () => {
  registerLocaleData(localeFr);
  let component: DriverFormComponent;
  let fixture: ComponentFixture<DriverFormComponent>;
  const close = vi.fn();

  beforeEach(async () => {
    close.mockClear();
    await TestBed.configureTestingModule({
      imports: [DriverFormComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'CREATE' } },
        { provide: MatDialogRef, useValue: { close } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DriverFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show the harmonized form and all required fields', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Nouveau chauffeur');
    expect(text).toContain('Identité');
    expect(text).toContain('Coordonnées');
    expect(text).toContain('Permis et activité');
    expect(text).toContain('Créer le chauffeur');
    expect(component.form.invalid).toBe(true);
  });

  it('should not close when the form is invalid', () => {
    component.onSubmit();
    expect(close).not.toHaveBeenCalled();
  });

  it('should return the driver payload and ISO dates without sending a request', () => {
    component.form.patchValue({
      civilite: 'Mme', nom: 'Dupont', prenom: 'Alice', email: 'alice@example.com',
      mobilePhoneNumber: '0601020304', adresse: 'Paris', workedDays: 20,
      licenseNumber: 'PERMIS-1', licenseExpirationDate: new Date(2030, 5, 12),
      hireDate: new Date(2026, 9, 24),
    });

    component.onSubmit();

    expect(close).toHaveBeenCalledExactlyOnceWith({
      civilite: 'Mme', nom: 'Dupont', prenom: 'Alice', email: 'alice@example.com',
      mobilePhoneNumber: '0601020304', adresse: 'Paris', workedDays: 20,
      licenseNumber: 'PERMIS-1', licenseExpirationDate: '2030-06-12',
      hireDate: '2026-10-24',
    });
  });
});
