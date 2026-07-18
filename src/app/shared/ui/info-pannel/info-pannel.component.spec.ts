import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoPannelComponent } from './info-pannel.component';

describe('InfoPannelComponent', () => {
  let component: InfoPannelComponent;
  let fixture: ComponentFixture<InfoPannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoPannelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoPannelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
