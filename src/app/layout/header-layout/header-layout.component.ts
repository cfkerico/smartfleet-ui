import { Component } from '@angular/core';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatFormField, MatInput, MatPrefix} from '@angular/material/input';
import { LayoutStateService } from '../../core/services/layout-state.service';
import {NotificationStoreService} from '../../core/services/notification-store.service';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatBadge} from '@angular/material/badge';
import {MatDivider} from '@angular/material/divider';
import {AuthService} from '../../core/auth/auth.service';
import {Notification} from '../../models/Notification';

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
    MatMenuItem,
    MatDivider
  ],
  templateUrl: './header-layout.component.html',
  styleUrl: './header-layout.component.scss',
})
export class HeaderLayoutComponent {

  constructor(public layoutStateService: LayoutStateService,
              public notificationStore: NotificationStoreService,
              private auth: AuthService) {}

  get profileName(): string {
    const fullName = [this.claim('given_name'), this.claim('family_name')].filter(Boolean).join(' ');
    return fullName || this.claim('name') || this.profileUsername || 'Mon compte';
  }

  get profileUsername(): string {
    return this.claim('preferred_username');
  }

  get profileEmail(): string {
    return this.claim('email');
  }

  toggleSidebar(): void {
    this.layoutStateService.toggleSidebar();
  }

  markAsRead(notification: Notification): void {
    this.notificationStore.markAsRead(notification);
  }

  logout(): void {
    void this.auth.logout();
  }

  private claim(name: string): string {
    const value: unknown = this.auth.getUser()?.[name];
    return typeof value === 'string' ? value.trim() : '';
  }
}
