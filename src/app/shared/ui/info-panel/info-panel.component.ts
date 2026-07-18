import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type InfoPanelVariant =
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

@Component({
  selector: 'sf-info-panel',
  standalone: true,
  imports: [
    MatIconModule
  ],
  templateUrl: './info-panel.component.html',
  styleUrl: './info-panel.component.scss',
})
export class InfoPanelComponent {

  readonly title = input.required<string>();
  readonly variant = input<InfoPanelVariant>('info');
  readonly icon = input('info');
}
