import {Component, Inject} from '@angular/core';
import {DriverAnalysis} from '../../models/driver-analysis.model';
import { CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import { MatButtonModule} from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-analyse-ia.component',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './analyse-ia.component.html',
  styleUrl: './analyse-ia.component.scss',
})
export class AnalyseIaComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: DriverAnalysis,
              private dialogRef: MatDialogRef<AnalyseIaComponent>,) {
  }

  close(): void {
    this.dialogRef.close();
  }
}
