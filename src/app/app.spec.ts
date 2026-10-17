import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { AuthService } from './core/auth/auth.service';
import { NotificationStoreService } from './core/services/notification-store.service';
import { NotificationWebSocketService } from './core/services/notification-web-socket.service';

describe('App', () => {
  const connect = vi.fn();
  const loadUnread = vi.fn();
  const listenRealtime = vi.fn();
  let authenticated = true;
  beforeEach(async () => {
    connect.mockReset();
    loadUnread.mockReset();
    listenRealtime.mockReset();
    authenticated = true;
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { isAuthenticated: () => authenticated },
        },
        {
          provide: NotificationWebSocketService,
          useValue: { connect },
        },
        {
          provide: NotificationStoreService,
          useValue: { loadUnread, listenRealtime },
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
    expect(connect).toHaveBeenCalledOnce();
    expect(loadUnread).toHaveBeenCalledOnce();
    expect(listenRealtime).toHaveBeenCalledOnce();
  });

  it('does not start notifications on the public signed-out page', () => {
    authenticated = false;
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(connect).not.toHaveBeenCalled();
    expect(loadUnread).not.toHaveBeenCalled();
    expect(listenRealtime).not.toHaveBeenCalled();
  });
});
