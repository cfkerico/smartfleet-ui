import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EMPTY, of } from 'rxjs';
import { AnalyticsService } from '../../core/services/analytics.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { NotificationWebSocketService } from '../../core/services/notification-web-socket.service';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: DashboardService, useValue: {} },
        {
          provide: AnalyticsService,
          useValue: { getDashboard: () => of({ driverActivity: {} }) },
        },
        {
          provide: NotificationWebSocketService,
          useValue: { notification$: EMPTY },
        },
      ],
    })
      .overrideComponent(DashboardComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
