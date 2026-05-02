import { CanActivateFn } from '@angular/router';
import { keycloak } from './keycloak';

export const authGuard: CanActivateFn = () => {
  console.log('authGuard', keycloak.authenticated);
  if (keycloak.authenticated) {
    return true;
  }

  keycloak.login();
  return false;
};