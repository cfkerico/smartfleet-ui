import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../core/services/analytics.service';
import { BaseChartDirective } from 'ng2-charts';
import { NotificationStoreService } from '../../core/services/notification-store.service';
import {AlertsWidgetComponent} from './alerts-widget/alerts-widget.component';
import {Observable, tap} from 'rxjs';
import {DashboardAnalytics} from '../../models/dashboard-analytics.model';
import {AsyncPipe} from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [
    BaseChartDirective,
    AlertsWidgetComponent,
    AsyncPipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {

  analytics$!: Observable<DashboardAnalytics>;
  chartLabels: string[] = [];
  chartData: number[] = [];

  constructor(private analyticsService: AnalyticsService,
              public notificationStore: NotificationStoreService) { }

  ngOnInit(): void {
    this.loadAnalytics();
  }

  private loadAnalytics(): void {
    this.analytics$ = this.analyticsService.getDashboard().pipe(
      tap(data => {
        this.chartLabels = Object.keys(data.driverActivity);
        this.chartData = Object.values(data.driverActivity);
      })
    );
  }

}
