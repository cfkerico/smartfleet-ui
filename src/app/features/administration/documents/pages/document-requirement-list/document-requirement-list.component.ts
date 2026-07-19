import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, takeWhile } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DocumentRequirementView } from '../../models/document-admin.model';
import { DocumentOwnerType } from '../../../../../shared/models/document-owner-type.model';
import { DocumentAdministrationApiService } from '../../services/document-administration-api.service';
import { DocumentRequirementFormDialogComponent } from '../../dialogs/document-requirement-form-dialog/document-requirement-form-dialog.component';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../../../../shared/ui/empty-state/empty-state.component';
import { OwnerChipComponent } from '../../../../../shared/ui/owner-chip/owner-chip.component';
import { StatusBadgeComponent, StatusBadgeVariant } from '../../../../../shared/ui/status-badge/status-badge.component';
import { DialogRef } from '@angular/cdk/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-document-requirement-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    EmptyStateComponent,
    OwnerChipComponent,
    StatusBadgeComponent,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatOptionModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
],
  templateUrl: './document-requirement-list.component.html',
  styleUrl: './document-requirement-list.component.scss',
})
export class DocumentRequirementListComponent implements OnInit, OnDestroy {

  private readonly api = inject(DocumentAdministrationApiService);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly snackBar = inject(MatSnackBar);

  readonly ownerTypes: DocumentOwnerType[] = [
    'DRIVER',
    'VEHICLE',
    'EXPENSE',
    'MAINTENANCE',
    'COMPANY'
  ];

  readonly ownerTypeControl = new FormControl<DocumentOwnerType>('VEHICLE', { nonNullable: true });

  readonly displayedColumns = [
    'document',
    'ownerType',
    'required',
    'expiration',
    'blocking',
    'warning',
    'status',
    'actions'
  ];
  readonly dataSource = new MatTableDataSource<DocumentRequirementView>([]);

  loading = false;

  ngOnInit(): void {
    this.loadRequirements();

    this.ownerTypeControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadRequirements();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRequirements(): void {
    this.loading = true;

    this.api.findDocumentRequirements(this.ownerTypeControl.value).pipe(takeUntil(this.destroy$)).subscribe({
      next: requirements => {
        this.dataSource.data = requirements;
        this.loading = false;
        this.cdr.detectChanges();
        console.log('================== requirements : ', JSON.stringify(requirements));
      },
      error: () => {
        this.loading = false;
      }
    });    
  }

  openCreateDialog(): void {
    console.log('----------- open : ', JSON.stringify(this.dataSource.data));
    const dialogRef = this.dialog.open(DocumentRequirementFormDialogComponent,
      {
        width: '760px',
        maxWidth: '95vw',
        disableClose: true,
        data: {
          mode: 'CREATE',
          ownerType: this.ownerTypeControl.value,
          configuredDocumentTypeIds: this.dataSource.data.map(requirement => requirement.documentTypeId)
        }
      }
    );

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result === true) {
          this.snackBar.open(
            'Exigence documentaire enregistrée avec succès.',
            'Fermer',
            {
              duration: 3500,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            }
          );
          this.loadRequirements();
        }
      });
  }

  openEditDialog(requirement: DocumentRequirementView): void {
    const dialorRef = this.dialog.open(DocumentRequirementFormDialogComponent,
      {
        width: '760px',
        maxWidth: '95vw',
        data: {
          mode: 'EDIT',
          requirement
        }
      }
    );

    dialorRef.afterClosed().pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result === true) {
          this.snackBar.open(
            'Exigence documentaire mise à jour.',
            'Fermer',
            {
              duration: 3500,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            }
          )
          this.loadRequirements();
        }
      });
  }

  blockingLabel(requirement: DocumentRequirementView): string {
    if (requirement.blockWhenMissing && requirement.blockWhenExpired) {
      return 'Absence et expiration';
    }

    if (requirement.blockWhenMissing) {
      return 'Absence';
    }

    if (requirement.blockWhenExpired) {
      return 'Expiration';
    }

    return 'Aucun';
  }

  blockingVariant(requirement: DocumentRequirementView): StatusBadgeVariant {
    return (requirement.blockWhenMissing || requirement.blockWhenExpired) ? 'danger' : 'neutral';
  }

  configurationStatusLabel(requirement: DocumentRequirementView): string {
    if (!requirement.active) {
      return 'Inactive';
    }

    if (!requirement.required) {
      return 'Facultative';
    }

    if (requirement.blockWhenMissing || requirement.blockWhenExpired) {
      return 'Critique';
    }

    return 'Active';
  }

  configurationStatusVariant(requirement: DocumentRequirementView): StatusBadgeVariant {
    if (!requirement.active) {
      return 'neutral';
    }

    if (!requirement.required) {
      return 'info';
    }

    if (requirement.blockWhenMissing || requirement.blockWhenExpired) {
      return 'warning';
    }

    return 'success';
  }

  ownerTypeLabel(ownerType: DocumentOwnerType): string {
    const labels: Record<DocumentOwnerType, string> = {
      DRIVER: 'chauffeur',
      VEHICLE: 'Vehicule',
      EXPENSE: 'Dépense',
      MAINTENANCE: 'Maintenance',
      COMPANY: 'Companie'
    };

    return labels[ownerType];
  }
}
