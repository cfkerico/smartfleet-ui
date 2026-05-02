import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppGlobalSpinnerComponent } from './app-global-spinner.component'

describe('AppGlobalSpinnerComponent', () => {
  let component: AppGlobalSpinnerComponent;
  let fixture: ComponentFixture<AppGlobalSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppGlobalSpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppGlobalSpinnerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
