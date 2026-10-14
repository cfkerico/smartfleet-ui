import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Vehicle } from '../../../../models/vehicle';

@Component({
  selector: 'app-vehicle-page-header',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './vehicle-page-header.component.html',
  styleUrl: './vehicle-page-header.component.scss',
})
export class VehiclePageHeaderComponent {
  @Input({ required: true }) vehicle!: Vehicle;
  @Input({ required: true }) eyebrow!: string;
}
