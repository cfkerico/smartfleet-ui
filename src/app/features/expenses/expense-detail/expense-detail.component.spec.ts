import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { of } from 'rxjs';
import { ExpenseApiService } from '../../../core/services/expense-api.service';
import { ExpenseDetailView } from '../../../models/expense.model';

import { ExpenseDetailComponent } from './expense-detail.component';

describe('ExpenseDetailComponent', () => {
  let component: ExpenseDetailComponent;
  let fixture: ComponentFixture<ExpenseDetailComponent>;
  const expenseApiMock = { findExpenseDetail: vi.fn() };
  const queryParams = { tab: null as string | null };

  const expenseDetail: ExpenseDetailView = {
    request: {
      id: 10,
      vehicleId: 3,
      vehicleLabel: 'Toyota Yaris',
      expenseType: 'INSURANCE',
      description: 'Assurance automobile',
      requestedAmount: 20000,
      priority: 'NORMAL',
      status: 'APPROVED',
      requestedBy: 'user-1',
      createdAt: new Date('2026-10-01T10:00:00Z'),
    },
    disbursements: [],
    totalPaid: 0,
    remainingAmount: 20000,
    fullyPaid: false,
    disbursementCount: 0,
    timeline: [],
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    queryParams.tab = null;
    expenseApiMock.findExpenseDetail.mockReturnValue(of(expenseDetail));

    await TestBed.configureTestingModule({
      imports: [ExpenseDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '10' }),
              queryParamMap: { get: (key: string) => key === 'tab' ? queryParams.tab : null },
            },
          },
        },
        { provide: ExpenseApiService, useValue: expenseApiMock },
        { provide: MatDialog, useValue: { open: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseDetailComponent);
    component = fixture.componentInstance;
  });

  it('opens the Documents tab when requested by the URL', async () => {
    queryParams.tab = 'documents';
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const tabs = fixture.debugElement.query(By.directive(MatTabGroup)).componentInstance as MatTabGroup;
    expect(expenseApiMock.findExpenseDetail).toHaveBeenCalledWith(10);
    expect(component.selectedTabIndex).toBe(3);
    expect(tabs.selectedIndex).toBe(3);
    expect(fixture.nativeElement.textContent).toContain('Ouvrir le dossier documentaire');
  });

  it('opens the Résumé tab by default', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const tabs = fixture.debugElement.query(By.directive(MatTabGroup)).componentInstance as MatTabGroup;
    expect(component.selectedTabIndex).toBe(0);
    expect(tabs.selectedIndex).toBe(0);
  });
});
