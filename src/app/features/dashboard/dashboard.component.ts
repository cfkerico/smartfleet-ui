import { Component, OnInit } from '@angular/core';
import { Dashboard } from '../../models/dashboard.model';
import { DashboardService } from '../../core/services/dashboard.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {

  dashboard!: Dashboard;

  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
   this.dashboardService.getDashboard().subscribe(data => {
      this.dashboard = data;
      this.cdr.detectChanges();
    });
  }


}
