import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleDocumentPageComponent } from './vehicle-document-page.component';

describe('VehicleDocumentPageComponent', () => {
  let component: VehicleDocumentPageComponent;
  let fixture: ComponentFixture<VehicleDocumentPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleDocumentPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleDocumentPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
