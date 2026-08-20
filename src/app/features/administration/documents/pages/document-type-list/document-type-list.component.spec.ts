import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DocumentAdministrationApiService } from '../../services/document-administration-api.service';

import { DocumentTypeListComponent } from './document-type-list.component';

describe('DocumentTypeListComponent', () => {
  let component: DocumentTypeListComponent;
  let fixture: ComponentFixture<DocumentTypeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentTypeListComponent],
      providers: [
        { provide: DocumentAdministrationApiService, useValue: { findDocumentTypes: () => of([]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentTypeListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
