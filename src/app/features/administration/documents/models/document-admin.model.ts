import { DocumentOwnerType } from "../../../../shared/models/document-owner-type.model"; 

export interface DocumentTypeView {
    id: number;
    code: string;
    label: string;
    description?: string | null;
    applicableOwnerType: DocumentOwnerType;
    active: boolean;
    systemType: boolean;
    createdAt: string;
    updatedAt?: string | null;
}

export interface DocumentRequirementView {
    id: number;

    documentTypeId: number;
    documentTypeCode: string;
    documentTypeLabel: string;

    ownerType: DocumentOwnerType;

    required: boolean;
    expirationRequired: boolean;

    blockWhenMissing: boolean;
    blockWhenExpired: boolean;

    warningDaysBeforeExpiration: number;

    active: boolean;
    displayOrder: number;

    createdAt: string;
    updatedAt?: string | null;
}

export interface CreateDocumentTypePayload {
    code: string;
    label: string;
    description?: string | null;
    applicableOwnerType: DocumentOwnerType;
}

export interface UpdateDocumentTypePayload {
    label: string;
    description?: string | null;
}

export interface ConfigureDocumentRequirementPayload {
    documentTypeId: number;
    ownerType: DocumentOwnerType;

    required: boolean;
    expirationRequired: boolean;

    blockWhenMissing: boolean;
    blockWhenExpired: boolean;

    warningDaysBeforeExpiration: number;
    displayOrder: number;
}

export interface UpdateDocumentRequirementPayload {
    required: boolean;
    expirationRequired: boolean;

    blockWhenMissing: boolean;
    blockWhenExpired: boolean;

    warningDaysBeforeExpiration: number;
    displayOrder: number;
}

export interface IdResponse {
    id: number;
}