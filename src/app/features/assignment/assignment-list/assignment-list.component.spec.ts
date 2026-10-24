import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AssignmentApiService } from '../../../core/services/assignment-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { provideRouter } from '@angular/router';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { VehicleAssignment } from '../../../models/vehicle-assignment.model';

import { AssignmentListComponent } from './assignment-list.component';

describe('AssignmentListComponent', () => {
  let component: AssignmentListComponent;
  let fixture: ComponentFixture<AssignmentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentListComponent],
      providers: [
        {
          provide: AssignmentApiService,
          useValue: { getAll: () => of({ content: [], totalElements: 0 }), endAssignment: () => of({}) },
        },
        { provide: NotificationService, useValue: { error: () => undefined, success: () => undefined } },
        { provide: ConfirmationService, useValue: { confirm: () => of(false) } },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignmentListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should request the selected server page without local pagination', () => {
    const service = TestBed.inject(AssignmentApiService);
    const getAll = vi.spyOn(service, 'getAll');

    component.onPageChange({ pageIndex: 1, pageSize: 10, length: 25 });

    expect(getAll).toHaveBeenCalledWith(1, 10);
    expect(component.assigments.paginator).toBeUndefined();
    expect(component.pageIndex).toBe(1);
    expect(component.pageSize).toBe(10);
  });

  it('should display the shared list layout and empty state', () => {
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.page-header h1')?.textContent?.trim()).toBe('Affectations');
    expect(element.querySelector('.list-search')).toBeTruthy();
    expect(element.querySelector('.table-card .table-scroll')).toBeTruthy();
    expect(element.querySelector('.empty-state')?.textContent).toContain(
      'Aucun élément à afficher.',
    );
  });

  it('should end an assignment without deleting it, then reload the history', () => {
    const service = TestBed.inject(AssignmentApiService);
    const confirmation = TestBed.inject(ConfirmationService);
    const end = vi.spyOn(service, 'endAssignment').mockReturnValue(of({} as VehicleAssignment));
    vi.spyOn(confirmation, 'confirm').mockReturnValue(of(true));
    const load = vi.spyOn(component, 'load');
    const assignment = { id: 7, driverFullName: 'Jean Dupont', vehicleLabel: 'Toyota', status: 'ACTIVE' } as any;

    component.endAssignment(assignment);

    expect(end).toHaveBeenCalledExactlyOnceWith(7);
    expect(load).toHaveBeenCalledOnce();
  });

  it('should not offer pause, resume or end for an ended assignment', () => {
    component.assigments.data = [{ id: 8, driverFullName: 'Jean Dupont', vehicleLabel: 'Toyota', status: 'ENDED' } as any];
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Jean Dupont');
    expect(fixture.nativeElement.querySelector('[aria-label="Terminer l’affectation"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Suspendre l’affectation"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Reprendre l’affectation"]')).toBeNull();
  });

  it.each([
    ['ACTIVE', 'Active', 'active'],
    ['TEMPORARY_ACTIVE', 'Temporaire active', 'temporary'],
    ['PAUSED', 'En pause', 'paused'],
    ['ENDED', 'Terminée', 'ended'],
    ['CANCELLED', 'Annulée', 'cancelled'],
  ])('should distinguish the %s assignment visually', (status, label, className) => {
    component.assigments.data = [{
      id: 9,
      driverFullName: 'Jean Dupont',
      vehicleLabel: 'Toyota',
      type: 'PRIMARY',
      status,
      startDate: '2026-10-24',
    } as VehicleAssignment];
    fixture.detectChanges();

    const row: HTMLElement | null = fixture.nativeElement.querySelector(`.assignment-row--${className}`);
    const badge: HTMLElement | null = row?.querySelector(`.assignment-status--${className}`) ?? null;
    expect(row).toBeTruthy();
    expect(badge?.textContent?.trim()).toBe(label);
  });
});
