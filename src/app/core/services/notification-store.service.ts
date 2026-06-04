import {Injectable, signal} from '@angular/core';
import {NotificationApiService} from './notification-api.service';
import {NotificationWebSocketService} from './notification-web-socket.service';
import { Notification } from '../../models/Notification'

@Injectable({
  providedIn: 'root',
})
export class NotificationStoreService {

  notifications = signal<Notification[]>([]);

  unreadCount = signal<number>(0);

  constructor(private notificationApi: NotificationApiService, private notificationWebSocket: NotificationWebSocketService) {
  }

  loadUnread(): void {
    this.notificationApi.getUnreadNotification().subscribe(
      notifications => {
        this.notifications.set(notifications);
        this.unreadCount.set(notifications.length);
      });
  }

  listenRealtime(): void {
    this.notificationWebSocket.notification$.subscribe(notification => {
      this.notifications.update(current => [notification, ...current]);

      this.unreadCount.update(count => count + 1);
    });
  }

  markAsRead(notification: Notification): void {
    this.notificationApi.markAsRead(notification.id).subscribe(() => {
      this.notifications.update(current => current.filter(item => item.id !== notification.id));

      this.unreadCount.update(count => Math.max(0, count - 1));
    });
  }
}
