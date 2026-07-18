import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type InfoPanelVariant =
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

@Component({
  selector: 'sf-info-pannel',
  standalone: true,
  imports: [
    MatIconModule
  ],
  templateUrl: './info-pannel.component.html',
  styleUrl: './info-pannel.component.scss',
})
export class InfoPannelComponent {

  readonly title = input.required<string>();
  readonly variant = input<InfoPanelVariant>('info');
  readonly icon = input('info');
}
