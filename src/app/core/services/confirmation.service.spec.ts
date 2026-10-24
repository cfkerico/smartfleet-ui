import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ConfirmationService } from './confirmation.service';
import { ConfirmationDialogComponent } from '../../shared/confirmation/confirmation-dialog.component';

describe('ConfirmationService', () => {
  const open = vi.fn();
  let service: ConfirmationService;

  beforeEach(() => {
    open.mockReset();
    TestBed.configureTestingModule({
      providers: [ConfirmationService, { provide: MatDialog, useValue: { open } }],
    });
    service = TestBed.inject(ConfirmationService);
  });

  it('should open the shared dialog and return true only after explicit confirmation', () => {
    open.mockReturnValue({ afterClosed: () => of(true) });
    const values: boolean[] = [];
    service.confirm({ title: 'Désactiver ?', message: 'Confirmer', confirmLabel: 'Désactiver' })
      .subscribe(value => values.push(value));
    expect(values).toEqual([true]);
    expect(open).toHaveBeenCalledWith(ConfirmationDialogComponent, expect.objectContaining({
      width: '440px', data: expect.objectContaining({ title: 'Désactiver ?' }),
    }));
  });

  it('should treat closing without a response as cancellation', () => {
    open.mockReturnValue({ afterClosed: () => of(undefined) });
    service.confirm({ title: 'Confirmer ?', message: 'Action', confirmLabel: 'Oui' })
      .subscribe(value => expect(value).toBe(false));
  });
});
