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

  it('should request the selected server page without local pagination', () => {
    const service = TestBed.inject(VehicleService);
    const getAll = vi.spyOn(service, 'getAll');

    component.onPageChange({ pageIndex: 1, pageSize: 10, length: 25 });
    fixture.detectChanges();

    expect(getAll).toHaveBeenCalledWith(1, 10);
    expect(component.vehicles.paginator).toBeNull();
    expect(component.pageIndex).toBe(1);
    expect(component.pageSize).toBe(10);
  });

  it('should display the shared list layout and empty state', () => {
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.page-header h1')?.textContent?.trim()).toBe('Véhicules');
    expect(element.querySelector('.list-search')).toBeTruthy();
    expect(element.querySelector('.table-card .table-scroll')).toBeTruthy();
    expect(element.querySelector('.empty-state')?.textContent).toContain(
      'Aucun élément à afficher.',
    );
  });
});
