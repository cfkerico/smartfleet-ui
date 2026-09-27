import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverDocumentPageComponent } from './driver-document-page.component';

describe('DriverDocumentPageComponent', () => {
  let component: DriverDocumentPageComponent;
  let fixture: ComponentFixture<DriverDocumentPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverDocumentPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DriverDocumentPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
