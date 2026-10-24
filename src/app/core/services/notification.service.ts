import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastComponent, ToastData } from '../../shared/toast/toast.component';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private readonly snackBar: MatSnackBar) {}

  success(message: string): void {
    this.show({ message, type: 'success' }, 4500);
  }

  error(message: string): void {
    this.show({ message, type: 'error' }, 6500);
  }

  private show(data: ToastData, duration: number): void {
    this.snackBar.openFromComponent(ToastComponent, {
      data,
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['smartfleet-toast-panel'],
      politeness: data.type === 'error' ? 'assertive' : 'polite',
    });
  }
}
