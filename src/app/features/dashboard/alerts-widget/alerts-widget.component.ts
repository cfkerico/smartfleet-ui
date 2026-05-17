import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Notification } from '../../../models/Notification';

@Component({
  standalone: true,
  selector: 'app-alerts-widget',
  imports: [CommonModule, MatIconModule],
  templateUrl: './alerts-widget.component.html',
  styleUrl: './alerts-widget.component.scss',
})
export class AlertsWidgetComponent {

  @Input()
  notifications: Notification[] = [];

  getIcon(type:string): string {
    switch (type) {
      case 'SUCCESS':
        return 'check_circle';

      case 'WARNING':
        return 'warning';

      case 'ERROR':
        return 'error';

      default:
        return 'info';
    }
  }
}
