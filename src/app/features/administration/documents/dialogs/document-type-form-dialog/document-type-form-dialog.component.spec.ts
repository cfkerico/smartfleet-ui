import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTypeFormDialogComponent } from './document-type-form-dialog.component';

describe('DocumentTypeFormDialogComponent', () => {
  let component: DocumentTypeFormDialogComponent;
  let fixture: ComponentFixture<DocumentTypeFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentTypeFormDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentTypeFormDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
