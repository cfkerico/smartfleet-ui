import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationWebSocketService} from './core/services/notification-web-socket.service';
import { AppGlobalSpinnerComponent } from './shared/spinner/app-global-spinner.component';
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

  constructor(private notificationService: NotificationWebSocketService, private authService: AuthService) {}

  ngOnInit(): void {
    const companyId = this.authService.getCompanyId();
    console.log('*********** companyId : ',companyId);
    this.notificationService.connect(companyId);
  }
}
