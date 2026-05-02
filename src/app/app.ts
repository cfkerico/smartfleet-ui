import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AppGlobalSpinnerComponent } from './shared/spinner/app-global-spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppGlobalSpinnerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('smartfleet-front');
}
