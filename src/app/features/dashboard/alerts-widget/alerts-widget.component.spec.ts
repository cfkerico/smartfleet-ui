import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertsWidgetComponent } from './alerts-widget.component';

describe('AlertsWidgetComponent', () => {
  let component: AlertsWidgetComponent;
  let fixture: ComponentFixture<AlertsWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertsWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertsWidgetComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the notification title, message and severity icon', () => {
    fixture.componentRef.setInput('notifications', [{
      id: 7,
      title: 'Entretien préventif',
      message: 'Échéance atteinte',
      severity: 'WARNING',
      status: 'UNREAD',
      createdAt: '2026-10-18T08:00:00Z',
    }]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Entretien préventif');
    expect(fixture.nativeElement.textContent).toContain('Échéance atteinte');
    expect(fixture.nativeElement.querySelector('.alert-icon mat-icon').textContent).toContain('warning');
  });
});
