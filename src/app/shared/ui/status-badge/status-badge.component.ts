import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type StatusBadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

@Component({
  selector: 'sf-status-badge',
  standalone: true,
  imports: [
    MatIconModule
  ],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {

  readonly label = input.required<string>();
  readonly variant = input<StatusBadgeVariant>('neutral');
  readonly icon = input<string>();
}
