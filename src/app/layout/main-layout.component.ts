import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import {HeaderLayoutComponent } from './header-layout/header-layout.component';
import {SidebarLayoutComponent} from './sidebar-layout/sidebar-layout.component';
import { LayoutStateService } from '../core/services/layout-state.service';
import {FooterLayoutComponent} from './footer-layout/footer-layout.component';

@Component({
  standalone: true,
  selector: 'app-main-layout.component',
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, HeaderLayoutComponent, SidebarLayoutComponent, FooterLayoutComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {

  constructor(public layoutService: LayoutStateService) {}
}
