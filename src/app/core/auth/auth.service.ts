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

  getCompanyId(): number {
    return Number(keycloak.tokenParsed?.['companyId']);
  }

  getUsername(): String {
    return keycloak.tokenParsed?.['username'];
  }

  getRoles(): string[] {
    const token = this.getToken();
    if (!token) {
      return [];
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      return payload.roles || [];
    } catch (error) {
      console.error('Token invalide', error);
      return [];
    }
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

}
