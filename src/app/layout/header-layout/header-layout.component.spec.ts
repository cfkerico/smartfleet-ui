import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { LayoutStateService } from '../../core/services/layout-state.service';
import { NotificationStoreService } from '../../core/services/notification-store.service';

import { HeaderLayoutComponent } from './header-layout.component';

describe('HeaderLayoutComponent', () => {
  let component: HeaderLayoutComponent;
  let fixture: ComponentFixture<HeaderLayoutComponent>;
  const logout = vi.fn().mockResolvedValue(undefined);
  const profile = {
    given_name: 'Amina',
    family_name: 'Diallo',
    preferred_username: 'amina.diallo',
    email: 'amina@example.test',
  };

  beforeEach(async () => {
    logout.mockClear();
    await TestBed.configureTestingModule({
      imports: [HeaderLayoutComponent],
      providers: [
        { provide: AuthService, useValue: { getUser: () => profile, logout } },
        { provide: LayoutStateService, useValue: { toggleSidebar: vi.fn() } },
        {
          provide: NotificationStoreService,
          useValue: { notifications: signal([]), unreadCount: signal(0), markAsRead: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderLayoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the authenticated user instead of the static label', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.profile-name').textContent).toContain('Amina Diallo');
    expect(fixture.nativeElement.textContent).not.toContain('CHOUPO');
  });

  it('should show profile details and call Keycloak logout', async () => {
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.profile-btn') as HTMLButtonElement).click();
    await fixture.whenStable();

    const menu = document.querySelector('.mat-mdc-menu-panel');
    expect(menu?.textContent).toContain('amina.diallo');
    expect(menu?.textContent).toContain('amina@example.test');

    (menu?.querySelector('.logout-button') as HTMLButtonElement).click();
    expect(logout).toHaveBeenCalledOnce();
  });
});
