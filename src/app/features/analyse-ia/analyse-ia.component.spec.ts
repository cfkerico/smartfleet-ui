import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyseIaComponent } from './analyse-ia.component';

describe('AnalyseIaComponentComponent', () => {
  let component: AnalyseIaComponent;
  let fixture: ComponentFixture<AnalyseIaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyseIaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyseIaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
