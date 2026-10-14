import { TestBed } from '@angular/core/testing';
import { VehiclePageHeaderComponent } from './vehicle-page-header.component';

describe('VehiclePageHeaderComponent', () => {
  it('should render the shared vehicle identity and page title', () => {
    TestBed.configureTestingModule({ imports: [VehiclePageHeaderComponent] });
    const fixture = TestBed.createComponent(VehiclePageHeaderComponent);
    fixture.componentRef.setInput('eyebrow', 'Historique des entretiens');
    fixture.componentRef.setInput('vehicle', {
      id: 1, brand: 'Toyota', model: 'Yaris', label: 'Toyota Yaris',
      registrationNumber: 'CE 138 FG', year: 2004, fuelType: 'ESSENCE',
      vehicleStatus: 'AVAILABLE', vin: 'VIN-1',
    });
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.vehicle-icon mat-icon')?.textContent).toContain('directions_car');
    expect(element.querySelector('.page-eyebrow')?.textContent).toContain('Historique des entretiens');
    expect(element.querySelector('h1')?.textContent).toContain('Toyota Yaris');
    expect(element.querySelector('.vehicle-metadata')?.textContent).toContain('CE 138 FG');
    expect(element.querySelector('.vehicle-metadata')?.textContent).toContain('2004');
  });
});
