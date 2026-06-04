import { Component } from '@angular/core';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatFormField, MatInput, MatPrefix} from '@angular/material/input';
import { LayoutStateService } from '../../core/services/layout-state.service';
import {NotificationStoreService} from '../../core/services/notification-store.service';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatBadge} from '@angular/material/badge';

@Component({
  standalone: true,
  selector: 'app-header-layout',
  imports: [
    MatIconButton,
    MatIcon,
    MatFormField,
    MatPrefix,
    MatInput,
    MatButton,
    MatMenuTrigger,
    MatBadge,
    MatMenu,
    MatMenuItem
  ],
  templateUrl: './header-layout.component.html',
  styleUrl: './header-layout.component.scss',
})
export class HeaderLayoutComponent {

  constructor(public layoutStateService: LayoutStateService,
              public notificationStore: NotificationStoreService,) {}

  toggleSidebar(): void {
    this.layoutStateService.toggleSidebar();
  }

  markAsRead(notification: any): void {
    this.notificationStore.markAsRead(notification);
  }
}
