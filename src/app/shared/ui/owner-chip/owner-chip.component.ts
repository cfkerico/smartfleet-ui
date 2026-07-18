import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { DocumentOwnerType } from '../../models/document-owner-type.model';

interface OwnerPresentation {
  label: string;
  icon: string;
}

const OWNER_PRESENTATIONS: Record<DocumentOwnerType, OwnerPresentation> = {

  DRIVER: {
    label: 'Chauffeur',
    icon: 'person'
  },

  VEHICLE: {
    label: 'Véhicule',
    icon: 'directions_car'
  },

  EXPENSE: {
    label: 'Dépense',
    icon: 'reques_quote'
  },

  MAINTENANCE: {
    label: 'Maintenance',
    icon: 'build'
  },

  COMPANY: {
    label: 'Compagnie',
    icon: 'business'
  }
}


@Component({
  selector: 'sf-owner-chip',
  standalone: true,
  imports: [
    MatIconModule
  ],
  templateUrl: './owner-chip.component.html',
  styleUrl: './owner-chip.component.scss',
})
export class OwnerChipComponent {

  readonly ownerType = input.required<DocumentOwnerType>();

  readonly presentation = computed(() => OWNER_PRESENTATIONS[this.ownerType()]);
}
