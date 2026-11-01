import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { financialRoleGuard } from './financial-role.guard';
import { routes } from '../../app.routes';

describe('financialRoleGuard', () => {
  const auth = { isAdmin: () => false, hasRole: (_role: string) => false };

  beforeEach(() => {
    auth.hasRole = () => false;
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
  });

  it('redirects a user without a financial role', () => {
    const result = TestBed.runInInjectionContext(() => financialRoleGuard({} as never, {} as never));
    expect(TestBed.inject(Router).serializeUrl(result as ReturnType<Router['createUrlTree']>))
      .toBe('/dashboard');
  });

  it('allows treasurers', () => {
    auth.hasRole = role => role === 'TREASURER';
    expect(TestBed.runInInjectionContext(() => financialRoleGuard({} as never, {} as never))).toBe(true);
    auth.hasRole = () => false;
  });

  it('applies the role guard to the reports route', () => {
    const reports = routes.find(route => route.path === '')?.children?.find(route => route.path === 'reports');
    expect(reports?.canActivate).toContain(financialRoleGuard);
  });
});
