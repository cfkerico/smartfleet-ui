import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationWebSocketService} from './core/services/notification-web-socket.service';
import { AppGlobalSpinnerComponent } from './shared/spinner/app-global-spinner.component';
import { NotificationStoreService } from './core/services/notification-store.service';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppGlobalSpinnerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('smartfleet-front');

  constructor(private notificationWebSocketService: NotificationWebSocketService,
              private notificationStore: NotificationStoreService,
              private auth: AuthService) {}

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) {
      return;
    }
    this.notificationWebSocketService.connect();

    this.notificationStore.loadUnread();
    this.notificationStore.listenRealtime();
  }
}
