import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentRequirementFormDialogComponent } from './document-requirement-form-dialog.component';

describe('DocumentRequirementFormDialogComponent', () => {
  let component: DocumentRequirementFormDialogComponent;
  let fixture: ComponentFixture<DocumentRequirementFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentRequirementFormDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentRequirementFormDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
