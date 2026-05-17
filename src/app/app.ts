import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationWebSocketService} from './core/services/notification-web-socket.service';
import { AppGlobalSpinnerComponent } from './shared/spinner/app-global-spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppGlobalSpinnerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('smartfleet-front');

  constructor(private notificationService: NotificationWebSocketService,) {}

  ngOnInit(): void {
    this.notificationService.connect();
    //throw new Error("Method not implemented.");
  }
}
