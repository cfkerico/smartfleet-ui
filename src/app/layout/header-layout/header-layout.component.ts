import { Component } from '@angular/core';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatFormField, MatInput, MatPrefix} from '@angular/material/input';
import { LayoutStateService } from '../../core/services/layout-state.service';

@Component({
  standalone: true,
  selector: 'app-header-layout',
  imports: [
    MatIconButton,
    MatIcon,
    MatFormField,
    MatPrefix,
    MatInput,
    MatButton
  ],
  templateUrl: './header-layout.component.html',
  styleUrl: './header-layout.component.scss',
})
export class HeaderLayoutComponent {

  constructor(public layoutStateService: LayoutStateService) {}

  toggleSidebar(): void {
    this.layoutStateService.toggleSidebar();
  }
}
