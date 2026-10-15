import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationWebSocketService} from './core/services/notification-web-socket.service';
import { AppGlobalSpinnerComponent } from './shared/spinner/app-global-spinner.component';
import { AuthService } from './core/auth/auth.service';
import { NotificationStoreService } from './core/services/notification-store.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppGlobalSpinnerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('smartfleet-front');

  constructor(private notificationWebSocketService: NotificationWebSocketService, private authService: AuthService,
              private notificationStore: NotificationStoreService) {}

  ngOnInit(): void {
    const companyId = this.authService.getCompanyId();

    this.notificationWebSocketService.connect(companyId, this.authService.getRoles());

    this.notificationStore.loadUnread();
    this.notificationStore.listenRealtime();
  }
}
