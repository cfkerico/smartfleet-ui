import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

export interface ToastData {
  message: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public readonly data: ToastData,
    private readonly snackBarRef: MatSnackBarRef<ToastComponent>,
  ) {}

  dismiss(): void {
    this.snackBarRef.dismiss();
  }
}
