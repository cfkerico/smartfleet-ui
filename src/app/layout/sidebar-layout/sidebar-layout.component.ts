import { Component } from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {RouterLink, RouterLinkActive} from '@angular/router';
import { LayoutStateService } from '../../core/services/layout-state.service';

@Component({
  standalone: true,
  selector: 'app-sidebar-layout',
  imports: [
    MatIcon,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar-layout.component.html',
  styleUrl: './sidebar-layout.component.scss',
})
export class SidebarLayoutComponent {

  constructor(public layoutStateService: LayoutStateService) {}
}
