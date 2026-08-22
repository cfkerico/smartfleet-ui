import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentDetailDialogComponent } from './document-detail-dialog.component';

describe('DocumentDetailDialogComponent', () => {
  let component: DocumentDetailDialogComponent;
  let fixture: ComponentFixture<DocumentDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentDetailDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentDetailDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
