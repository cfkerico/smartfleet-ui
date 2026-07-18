import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'sf-page-header',
  standalone: true,
  imports: [
    MatIconModule
  ],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {

  readonly title = input.required<string>();

  readonly description = input<string>();

  readonly icon = input<string>();
}
