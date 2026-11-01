import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const financialRoleGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAdmin() || auth.hasRole('TREASURER')
    ? true
    : inject(Router).createUrlTree(['/dashboard']);
};
