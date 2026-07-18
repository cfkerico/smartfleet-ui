import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerChipComponent } from './owner-chip.component';

describe('OwnerChipComponent', () => {
  let component: OwnerChipComponent;
  let fixture: ComponentFixture<OwnerChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerChipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerChipComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
