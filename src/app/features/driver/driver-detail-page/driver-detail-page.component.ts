import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DriverService } from '../../../core/services/driver.service';
import { Driver } from '../../../models/driver.model';

@Component({
  selector: 'app-driver-detail-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './driver-detail-page.component.html',
  styleUrl: '../../shared/entity-detail-page.scss',
})
export class DriverDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly driverService = inject(DriverService);

  readonly driver = signal<Driver | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const driverId = Number(this.route.snapshot.paramMap.get('driverId'));
    if (!Number.isSafeInteger(driverId) || driverId <= 0) {
      this.loading.set(false);
      this.error.set('Identifiant du chauffeur invalide.');
      return;
    }

    this.driverService.getById(driverId).pipe(
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: driver => this.driver.set(driver),
      error: () => this.error.set('Impossible de charger ce chauffeur.'),
    });
  }
}
