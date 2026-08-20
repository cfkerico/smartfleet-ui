import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AnalyseIaComponent } from './analyse-ia.component';

describe('AnalyseIaComponentComponent', () => {
  let component: AnalyseIaComponent;
  let fixture: ComponentFixture<AnalyseIaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyseIaComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyseIaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
