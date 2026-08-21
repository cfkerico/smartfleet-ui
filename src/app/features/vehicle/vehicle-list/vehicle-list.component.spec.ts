import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { VehicleService } from '../../../core/services/vehicle.service';

import { VehicleListComponent } from './vehicle-list.component';

import { provideRouter } from '@angular/router';


describe('VehicleListComponent', () => {
  let component: VehicleListComponent;
  let fixture: ComponentFixture<VehicleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleListComponent],
      providers: [
        provideRouter([]),
        {
          provide: VehicleService,
          useValue: { getAll: () => of({ content: [], totalElements: 0 }) },
        },
        { provide: NotificationService, useValue: { error: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
