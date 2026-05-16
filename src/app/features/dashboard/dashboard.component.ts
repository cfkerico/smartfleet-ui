import { Component, OnInit } from '@angular/core';
import { Dashboard } from '../../models/dashboard.model';
import { DashboardService } from '../../core/services/dashboard.service';
import { ChangeDetectorRef } from '@angular/core';
import { AnalyticsService } from '../../core/services/analytics.service';
import {Analytics} from '@angular/cli/lib/config/workspace-schema';
import {BaseChartDirective} from 'ng2-charts';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [
    BaseChartDirective
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {

  dashboard!: Dashboard;

  analytics: any;
  chartLabels: string[] = [];
  chartData: number[] = [];

  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef,
              private analyticsService: AnalyticsService) { }

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
   })
  }


}
