import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { AnalyticsService } from '../../core/services/analytics.service';
import { NotificationStoreService } from '../../core/services/notification-store.service';
import { Notification } from '../../models/Notification';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  const unreadNotifications = signal<Notification[]>([]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        {
          provide: AnalyticsService,
          useValue: { getDashboard: () => of({ driverActivity: {} }) },
        },
        {
          provide: NotificationStoreService,
          useValue: { notifications: unreadNotifications },
        },
      ],
    })
      .overrideComponent(DashboardComponent, {
        set: { template: '<app-alerts-widget [notifications]="notificationStore.notifications()" />' },
      })
      .compileComponents();

    unreadNotifications.set([]);
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display unread notifications from the shared store and react to changes', () => {
    unreadNotifications.set([{
      id: 1,
      title: 'Entretien préventif',
      message: 'Échéance dans 7 jours',
      severity: 'INFO',
      status: 'UNREAD',
      createdAt: '2026-10-18T08:00:00Z',
    }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Échéance dans 7 jours');

    unreadNotifications.set([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Aucune notification non lue');
  });
});
