import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
} from '../../shared/confirmation/confirmation-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  constructor(private readonly dialog: MatDialog) {}

  confirm(data: ConfirmationDialogData): Observable<boolean> {
    return this.dialog.open<ConfirmationDialogComponent, ConfirmationDialogData, boolean>(
      ConfirmationDialogComponent,
      {
        width: '440px',
        maxWidth: 'calc(100vw - 32px)',
        autoFocus: false,
        restoreFocus: true,
        data,
      },
    ).afterClosed().pipe(map(result => result === true));
  }
}
