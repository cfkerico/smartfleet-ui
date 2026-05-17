import { Component, OnInit } from '@angular/core';
import { Dashboard } from '../../models/dashboard.model';
import { DashboardService } from '../../core/services/dashboard.service';
import { ChangeDetectorRef } from '@angular/core';
import { AnalyticsService } from '../../core/services/analytics.service';
import { BaseChartDirective } from 'ng2-charts';
import { NotificationWebSocketService} from '../../core/services/notification-web-socket.service';
import {AlertsWidgetComponent} from './alerts-widget/alerts-widget.component';
import {NotificationType, Notification } from '../../models/Notification';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [
    BaseChartDirective,
    AlertsWidgetComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {

  dashboard!: Dashboard;

  analytics: any;
  chartLabels: string[] = [];
  chartData: number[] = [];
  notifications: Notification[] = [];

  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef,
              private analyticsService: AnalyticsService, private notificationService: NotificationWebSocketService) { }

  ngOnInit(): void {
   this.dashboardService.getDashboard().subscribe(data => {
      this.dashboard = data;
      this.cdr.detectChanges();
    });

   this.analyticsService.getDashboard().subscribe({
     next: data => {
       this.analytics = data;
       this.chartLabels = Object.keys(data.driverActivity);
       this.chartData = Object.values(data.driverActivity);
     }
   });

    //this.notificationService.connect();
    this.listenNotifications();

  }

  private listenNotifications(): void {
    this.notificationService.notification$.subscribe(notification => {
      this.notifications.unshift(notification);
      this.cdr.detectChanges();
    });
  }

}
