import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectorRef } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { DocumentRequirementView, DocumentTypeView } from '../../models/document-admin.model';
import { DocumentOwnerType } from '../../../../../shared/models/document-owner-type.model';
import { DocumentAdministrationApiService } from '../../services/document-administration-api.service';
import { InfoPanelComponent } from '../../../../../shared/ui/info-panel/info-panel.component';
import { OwnerChipComponent } from '../../../../../shared/ui/owner-chip/owner-chip.component';

interface DocumentRequirementDialogData {
  mode: 'CREATE' | 'EDIT';
  ownerType?: DocumentOwnerType;
  requirement?: DocumentRequirementView;
  configuredDocumentTypeIds?: number[];
}

@Component({
  selector: 'app-document-requirement-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InfoPanelComponent,
    OwnerChipComponent,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule
],
  templateUrl: './document-requirement-form-dialog.component.html',
  styleUrl: './document-requirement-form-dialog.component.scss',
})
export class DocumentRequirementFormDialogComponent {

  private readonly fb = inject(FormBuilder);
  private readonly api = inject(DocumentAdministrationApiService);
  private readonly dialogRef = inject(MatDialogRef<DocumentRequirementFormDialogComponent>);
  private readonly cdr = inject(ChangeDetectorRef);
  
  readonly data = inject<DocumentRequirementDialogData>(MAT_DIALOG_DATA);

  readonly ownerType = this.data.requirement?.ownerType ?? this.data.ownerType ?? 'VEHICLE';
  
  documentTypes: DocumentTypeView[] = [];

  errorMessage: string | null = null;

  loadingDocumentTypes = false;
  saving = false;

  readonly form = this.fb.group({
    documentTypeId: [
      {
        value: this.data.requirement?.documentTypeId ?? null, 
        disabled: this.data.mode === 'EDIT'
      },
      Validators.required
    ],

    required: this.fb.nonNullable.control(this.data.requirement?.required ?? true),

    expirationRequired: this.fb.nonNullable.control(this.data.requirement?.expirationRequired ?? false),

    blockWhenMissing: this.fb.nonNullable.control(this.data.requirement?.blockWhenMissing ?? false),

    blockWhenExpired: this.fb.nonNullable.control(this.data.requirement?.blockWhenExpired ?? false),

    warningDaysBeforeExpiration: this.fb.nonNullable.control(this.data.requirement?.warningDaysBeforeExpiration ?? 0, 
      [
        Validators.required,
        Validators.min(0),
        Validators.max(365)
    ]),

    displayOrder: this.fb.nonNullable.control(this.data.requirement?.displayOrder ?? 1, 
      [
        Validators.required,
        Validators.min(0)
      ])
  });

  constructor() {
    this.loadDocumentTypes();
    this.configureDependentFields();
  }

  get selectedocumentType(): DocumentTypeView | undefined {

    const documentTypeId = this.form.controls.documentTypeId.value;

    return this.documentTypes.find(item => item.id === documentTypeId);
  }

  get consequences(): string[] {
    const raw = this.form.getRawValue();

    const ownerLabel = 
      this.ownerType === 'VEHICLE' ? 'véhicule' : this.ownerType === 'DRIVER' ? 'chauffeur' : 'élément concerné';

    const documentLabel = this.selectedocumentType?.label ?? this.data.requirement?.documentTypeLabel ?? 'ce document';

    const consequences: string[] = [];

    if(raw.required) {
      consequences.push(`Chaque ${ownerLabel} devra posséder ${documentLabel}.`);
    } else {
      consequences.push(`${documentLabel} reste facultatif.`);
    }

    if (raw.expirationRequired && Number(raw.warningDaysBeforeExpiration) > 0) {
      consequences.push(`Une alerte sera prévue ${raw.warningDaysBeforeExpiration} jours avant son expiration.`);
    }

    if (raw.blockWhenMissing) {
      consequences.push(`Un ${ownerLabel} sans ce document sera considéré comme non conforme et pourra être bloqué.`);
    }

    if (raw.blockWhenExpired) {
      consequences.push(`Un ${ownerLabel} dont le document est expiré sera considéré comme non conforme et pourra être bloqué.`);
    }

    if (!raw.blockWhenMissing && !raw.blockWhenExpired) {
      consequences.push(`Cette règle ne provoquera aucun blocage automatique.`);
    }

    return consequences;
  }

  loadDocumentTypes(): void {
    this.loadingDocumentTypes = true;

    this.api.findDocumentTypes(this.ownerType).subscribe({
      next: documentTypes => {
        this.documentTypes = documentTypes;
        this.loadingDocumentTypes = false;
      },
      error: () => {
        this.loadingDocumentTypes = false;
      }
    });
  }

  configureDependentFields(): void {
    this.form.controls.required.valueChanges.subscribe(required => {
      if (!required) {
        this.form.controls.blockWhenMissing.setValue(false);
      }
    });

    this.form.controls.expirationRequired.valueChanges.subscribe(expirationRequired => {
      if (!expirationRequired) {
        this.form.controls.blockWhenExpired.setValue(false);

        this.form.controls.warningDaysBeforeExpiration.setValue(0);
      }
    });
  }

  submit(): void {

    this.errorMessage = null;

    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.saving = true;

    if (this.data.mode === 'CREATE') {
      this.api
        .configureDocumentRequirement({
          documentTypeId:
            raw.documentTypeId!,
          ownerType: this.ownerType,
          required: raw.required,
          expirationRequired: raw.expirationRequired,
          blockWhenMissing: raw.blockWhenMissing,
          blockWhenExpired: raw.blockWhenExpired,
          warningDaysBeforeExpiration: raw.warningDaysBeforeExpiration,
          displayOrder: raw.displayOrder
        }).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: error => {
          this.saving = false;

          this.errorMessage = error?.error?.message ?? `Une erreur est survenue pendant l'enregistrement.`;
          this.cdr.detectChanges();
        }
      });

      return;
    }

    this.api
      .updateDocumentRequirement(
        this.data.requirement!.id,
        {
          required: raw.required,
          expirationRequired: raw.expirationRequired,
          blockWhenMissing: raw.blockWhenMissing,
          blockWhenExpired: raw.blockWhenExpired,
          warningDaysBeforeExpiration: raw.warningDaysBeforeExpiration,
          displayOrder: raw.displayOrder
        }
      ).subscribe({
        next: () => { 
          this.dialogRef.close(true); 
        },
        error: error => {
          this.saving = false;
          this.errorMessage = error?.error?.message ?? `Une erreur est survenue pendant la mise à jour.`;
          this.cdr.detectChanges();
        }
      });
  }

  close(): void {
    this.dialogRef.close(false);
  }

  isDocumentTypeAlreadyConfigured (documentTypeId: number): boolean {    
    //console.log ('++++++++++++++++++ : ', JSON.stringify(this.data));
    //console.log('-----documentTypeId------ : ', documentTypeId);
    return this.data.configuredDocumentTypeIds?.includes(documentTypeId) ?? false;
  }

  get availableDocumentTypes(): DocumentTypeView[] {
    return this.documentTypes.filter(documentType => !this.isDocumentTypeAlreadyConfigured(documentType.id));
  }



}
