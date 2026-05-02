import { Injectable } from '@angular/core';
import { keycloak } from './keycloak';

@Injectable({ providedIn: 'root' })
export class AuthService {

  login() {
    return keycloak.login();
  }

  logout() {
    return keycloak.logout();
  }

  getToken(): string | undefined {
    return keycloak.token;
  }

  isAuthenticated(): boolean {
    return !!keycloak.authenticated;
  }

  getUser() {
    return keycloak.tokenParsed;
  }
}