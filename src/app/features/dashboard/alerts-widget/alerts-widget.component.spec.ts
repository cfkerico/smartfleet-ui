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
});
