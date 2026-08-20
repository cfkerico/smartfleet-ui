import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { DriverService } from '../../../core/services/driver.service';

import { DriverFormComponent } from './driver-form.component';

describe('DriverFormComponent', () => {
  let component: DriverFormComponent;
  let fixture: ComponentFixture<DriverFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverFormComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'CREATE' } },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: DriverService, useValue: { create: () => of(null), update: () => of(null) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DriverFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
