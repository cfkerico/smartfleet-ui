import { TestBed } from '@angular/core/testing';

import { DocumentAdministrationApiService } from './document-administration-api.service';

describe('DocumentAdministrationApiService', () => {
  let service: DocumentAdministrationApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentAdministrationApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
