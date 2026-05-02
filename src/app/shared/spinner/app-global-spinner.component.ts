import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LoadingService } from '../../core/services/loading.service';

@Component({
  standalone: true,
  selector: 'app-global-spinner',
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './app-global-spinner.component.html',
  styleUrl: './app-global-spinner.component.scss',
})
export class AppGlobalSpinnerComponent {
  loading;

  constructor(private loadingService: LoadingService) {
    this.loading = loadingService.loading
  }
}
