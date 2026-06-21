import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentListComponent } from './assignment-list.component';

describe('AssignmentListComponent', () => {
  let component: AssignmentListComponent;
  let fixture: ComponentFixture<AssignmentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignmentListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
