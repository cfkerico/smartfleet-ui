import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { Subject, Observable } from 'rxjs';
import { Notification } from '../../models/Notification';

@Injectable({
  providedIn: 'root',
})
export class NotificationWebSocketService {

  private client!: Client;
  private notificationSubject = new Subject<Notification>();
  notification$: Observable<Notification> = this.notificationSubject.asObservable();

  connect(companyId: number): void {

    this.client = new Client({

      brokerURL:
        'ws://localhost:8080/ws',

      reconnectDelay: 5000,

      debug: (message) => {

        console.log(message);
      },

      onConnect: () => {

        console.log(
          'WebSocket connected'
        );

        this.subscribeToAlerts(companyId);

      },

      onStompError: frame => {

        console.error(
          'Broker error',
          frame
        );
      }
    });

    this.client.activate();
  }

  private subscribeToAlerts(companyId: number): void {
    this.client.subscribe(
      `/topic/alerts/${companyId}`,
      message => {
        const notification = JSON.parse(message.body) as Notification;
        console.log('NOTIFICATION RECEIVED',
          notification
        );

        this.notificationSubject.next(notification);
      }
    );
  }

  disconnect(): void {

    this.client.deactivate();
  }
}
