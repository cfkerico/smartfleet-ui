import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification.service';
import { ToastComponent } from '../../shared/toast/toast.component';

describe('NotificationService', () => {
  const openFromComponent = vi.fn();
  let service: NotificationService;

  beforeEach(() => {
    openFromComponent.mockReset();
    TestBed.configureTestingModule({
      providers: [NotificationService, { provide: MatSnackBar, useValue: { openFromComponent } }],
    });
    service = TestBed.inject(NotificationService);
  });

  it('should show success in the top-right corner and dismiss automatically', () => {
    service.success('Enregistré');
    expect(openFromComponent).toHaveBeenCalledWith(ToastComponent, expect.objectContaining({
      data: { type: 'success', message: 'Enregistré' },
      horizontalPosition: 'end', verticalPosition: 'top', duration: 4500,
    }));
  });

  it('should keep errors visible longer', () => {
    service.error('Échec');
    expect(openFromComponent).toHaveBeenCalledWith(ToastComponent, expect.objectContaining({
      data: { type: 'error', message: 'Échec' }, duration: 6500,
    }));
  });
});
