import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';
import { DocumentApiService } from '../../services/document-api.service';

import { OwnerDocumentListDialogComponent } from './owner-document-list-dialog.component';

describe('OwnerDocumentListDialogComponent', () => {
  let component: OwnerDocumentListDialogComponent;
  let fixture: ComponentFixture<OwnerDocumentListDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerDocumentListDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { ownerType: 'VEHICLE', ownerId: 10, ownerDisplayName: 'Véhicule test' },
        },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        {
          provide: DocumentApiService,
          useValue: {
            findByOwner: () => of({
              content: [], page: 0, size: 10,
              totalElements: 0, totalPages: 0, last: true,
            }),
          },
        },
        { provide: NotificationService, useValue: { error: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerDocumentListDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
