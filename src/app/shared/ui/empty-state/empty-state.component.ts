import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'sf-empty-state',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {

  readonly icon = input('inbox');

  readonly title = input.required<string>();

  readonly description = input<string>();

  readonly actionLabel = input<string>();

  readonly actionIcon = input('add');

  readonly action = output<void>();
}
