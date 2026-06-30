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
            canActivate: [authGuard],
            loadComponent: () =>
              import('./features/driver/driver-list.component').then(m => m.DriverListComponent)
          },
          {
            path: 'vehicles',
            canActivate: [authGuard],
            loadComponent: () =>
              import('./features/vehicle/vehicle-list/vehicle-list.component').then(m => m.VehicleListComponent)
          },
          {
            path: 'revenues/payments',
            canActivate: [authGuard],
            loadComponent: () =>
              import('./features/payment/payment-history.component').then(m => m.PaymentHistoryComponent)
          },
          {
            path: 'assignments',
            canActivate: [authGuard],
            loadComponent: () =>
              import('./features/assignment/assignment-list/assignment-list.component').then(m => m.AssignmentListComponent)
          },
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          }
        ]
  }
  ];
