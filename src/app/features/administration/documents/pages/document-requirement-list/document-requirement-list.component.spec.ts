import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentRequirementListComponent } from './document-requirement-list.component';

describe('DocumentRequirementListComponent', () => {
  let component: DocumentRequirementListComponent;
  let fixture: ComponentFixture<DocumentRequirementListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentRequirementListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentRequirementListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
