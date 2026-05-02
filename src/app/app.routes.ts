import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
        loadComponent: () =>
          import('./layout/main-layout.component').then(m => m.MainLayoutComponent),
        children: [
          {
            path: 'dashboard',
            canActivate: [authGuard],
            loadComponent: () =>
              import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
          },
          {
            path: 'drivers',
            loadComponent: () =>
              import('./features/driver/driver-list.component').then(m => m.DriverListComponent)
          },
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          }
        ]
  }
  ];
