import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { OwnerDocumentCompliance } from '../../models/document.model';
import { DocumentApiService } from '../../services/document-api.service';
import { OwnerDocumentComplianceComponent } from './owner-document-compliance.component';

describe('OwnerDocumentComplianceComponent', () => {
  let component: OwnerDocumentComplianceComponent;
  let fixture: ComponentFixture<OwnerDocumentComplianceComponent>;

  const documentApiMock = {
    findCompliance: vi.fn(),
  };

  const complianceResponse: OwnerDocumentCompliance = {
    ownerType: 'VEHICLE',
    ownerId: 10,
    referenceDate: '2026-08-19',

    totalRequired: 2,
    compliantRequired: 1,
    missingRequired: 1,
    expiredRequired: 0,
    expiringSoon: 1,

    compliant: false,
    blocked: true,

    items: [
      {
        requirementId: 100,
        documentTypeId: 200,
        documentTypeCode: 'VEHICLE_INSURANCE',
        documentTypeLabel: 'Assurance automobile',

        required: true,
        expirationRequired: true,
        displayOrder: 1,

        complianceStatus: 'EXPIRING_SOON',
        blocking: false,

        documentId: 300,
        documentTitle: 'Assurance 2026',
        activeVersionId: 400,
        currentVersionNumber: 1,
        issuedDate: '2026-01-01',
        expirationDate: '2026-08-29',
        daysUntilExpiration: 10        
      },
      {
        requirementId: 101,
        documentTypeId: 201,
        documentTypeCode: 'TECHNICAL_TEST',
        documentTypeLabel: 'Contrôle technique',

        required: true,
        expirationRequired: true,
        displayOrder: 2,

        complianceStatus: 'MISSING',
        blocking: true,

        documentId: null,
        documentTitle: null,
        activeVersionId: null,
        currentVersionNumber: null,
        issuedDate: null,
        expirationDate: null,
        daysUntilExpiration: null
      }
    ]
  };

  beforeEach(async () => {
    documentApiMock.findCompliance.mockReset();
    documentApiMock.findCompliance.mockReturnValue(of(complianceResponse));

    await TestBed.configureTestingModule({
      imports: [OwnerDocumentComplianceComponent],
      providers: [
        {
          provide: DocumentApiService,
          useValue: documentApiMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerDocumentComplianceComponent);
    component = fixture.componentInstance;

    /**
     * Les inputs obligatoires doivent être fournis avant 
     * la première détection de changements.
     */
    fixture.componentRef.setInput('ownerType', 'VEHICLE');
    fixture.componentRef.setInput('ownerId', 10);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should load and separate owner compliance items', () => {
    expect(component).toBeTruthy();

    expect(documentApiMock.findCompliance).toHaveBeenCalledWith('VEHICLE', 10);

    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();

    expect(component.compliance()).toEqual(complianceResponse);

    expect(component.missingItems()).toHaveLength(1);
    expect(component.missingItems()[0].documentTypeCode).toBe('TECHNICAL_TEST');

    expect(component.availableItems()).toHaveLength(1);
    expect(component.availableItems()[0].documentTypeCode).toBe('VEHICLE_INSURANCE');

    expect(component.attentionItems()).toHaveLength(1);
    expect(component.attentionItems()[0].complianceStatus).toBe('EXPIRING_SOON');

    expect(component.compliancePercentage()).toBe(50);
  });

  it('should display the compliance summary', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Conformité documentaire');
    expect(element.textContent.replace(/\s+/g, ' ')).toContain('1 / 2');
    expect(element.textContent).toContain('Assurance automobile');
    expect(element.textContent).toContain('Contrôle technique');
    expect(element.textContent).toContain('Situation documentaire bloquante');
  });

  it('should emit the missing item when add is requested', () => {
    const addRequested = vi.fn();

    component.addRequested.subscribe(addRequested);

    const addButton = fixture.nativeElement.querySelector('.missing-row .document-actions button') as HTMLButtonElement;

    addButton.click();

    expect(addRequested).toHaveBeenCalledWith(complianceResponse.items[1]);
  });
});
