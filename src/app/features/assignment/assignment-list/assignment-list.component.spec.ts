import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AssignmentApiService } from '../../../core/services/assignment-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { provideRouter } from '@angular/router';

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
          useValue: { getAll: () => of({ content: [], totalElements: 0 }) },
        },
        { provide: NotificationService, useValue: { error: () => undefined } },
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
});
