import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerDocumentListDialogComponent } from './owner-document-list-dialog.component';

describe('OwnerDocumentListDialogComponent', () => {
  let component: OwnerDocumentListDialogComponent;
  let fixture: ComponentFixture<OwnerDocumentListDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerDocumentListDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerDocumentListDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
