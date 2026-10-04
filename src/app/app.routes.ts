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
            path: 'drivers/:driverId/documents',
            canActivate: [authGuard],
            loadComponent: () =>
              import('./features/driver/driver-document-page/driver-document-page.component')
            .then(module => module.DriverDocumentPageComponent),
          },
          {
            path: 'vehicles/:vehicleId/documents',
            canActivate: [authGuard],
            loadComponent: () => 
              import('./features/vehicle/vehicle-document-page/vehicle-document-page.component')
            .then(module => module.VehicleDocumentPageComponent),
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
            path: 'expenses',
            canActivate: [authGuard],
            loadComponent: () =>
              import('./features/expenses/expense-list/expense-list.component').then(m => m.ExpenseListComponent)
          },
          {
            path: 'expenses/:id/documents',
            canActivate: [authGuard],
            loadComponent: () => 
              import('./features/expenses/expense-document-page/expense-document-page.component').then(m => m.ExpenseDocumentPageComponent)
          },
          {
            path: 'expenses/:id',
            canActivate: [authGuard],
            loadComponent: () => 
              import('./features/expenses/expense-detail/expense-detail.component').then(m => m.ExpenseDetailComponent)
          },
          {
            path: 'administration/document-types',
            canActivate: [authGuard],
            loadComponent: () => 
              import('./features/administration/documents/pages/document-type-list/document-type-list.component').then(m => m.DocumentTypeListComponent)
          },
          {
            path: 'administration/document-requirements',
            canActivate: [authGuard],
            loadComponent: () => 
              import('./features/administration/documents/pages/document-requirement-list/document-requirement-list.component').then(m => m.DocumentRequirementListComponent)
          },
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          }
        ]
  }
  ];
