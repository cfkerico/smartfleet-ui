import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { AuthService } from './core/auth/auth.service';
import { NotificationStoreService } from './core/services/notification-store.service';
import { NotificationWebSocketService } from './core/services/notification-web-socket.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { getCompanyId: () => 1, getRoles: () => ['ADMIN'] },
        },
        {
          provide: NotificationWebSocketService,
          useValue: { connect: () => undefined },
        },
        {
          provide: NotificationStoreService,
          useValue: { loadUnread: () => undefined, listenRealtime: () => undefined },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the application shell', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeTruthy();
  });
});
