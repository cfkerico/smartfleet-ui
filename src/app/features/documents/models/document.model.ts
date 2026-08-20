import { DocumentOwnerType } from "../../../shared/models/document-owner-type.model";

export type DocumentStatus = 
  | 'DRAFT'
  | 'VALID'
  | 'EXPIRED'
  | 'REJECTED'
  | 'ARCHIVED';


export type DocumentComplianceStatus = 
  | 'MISSING'
  | 'DRAFT'
  | 'INCOMPLETE'
  | 'VALID'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'REJECTED';


export interface DocumentComplianceItem {
    requirementId: number;
    documentTypeId: number;
    documentTypeCode: string;
    documentTypeLabel: string;

    required: boolean;
    expirationRequired: boolean;
    displayOrder: number;

    complianceStatus: DocumentComplianceStatus;
    blocking: boolean;

    documentId: number | null;
    documentTitle: string | null;
    activeVersionId: number | null;
    currentVersionNumber: number | null;
    issuedDate: string | null;
    expirationDate: string | null;
    daysUntilExpiration: number | null;
}

export interface OwnerDocumentCompliance {
    ownerType: DocumentOwnerType;
    ownerId: number;
    referenceDate: string;

    totalRequired: number;
    compliantRequired: number;
    missingRequired: number;
    expiredRequired: number;
    expiringSoon: number;

    compliant: boolean;
    blocked: boolean;

    items: DocumentComplianceItem[];

}



export interface CreateDocumentMetadata {
    documentTypeId: number;
    ownerType: DocumentOwnerType;
    ownerId: number;
    title: string;
    documentNumber?: string;
    issuedDate?: string;
    expirationDate?: string;
    comment?: string;
}

export interface CreateDocumentResponse {
    documentId: number;
    documentVersionId: number;
    documentTypeId: number;
    ownerType: DocumentOwnerType;
    ownerId: number;
    title: string;
    status: DocumentStatus;
    versionNumber: number;
    documentNumber: string | null;
    issuedDate: string | null;
    expirationDate: string | null;
    originalFileName: string;
    contentType: string;
    fileSize: number;
}

export interface DocumentSummary {
    documentId: number;
    documentTypeId: number;
    documentTypeLabel: string;
    ownerType: DocumentOwnerType;
    ownerId: number;
    title: string;
    status: DocumentStatus;
    activeVersionId: number | null;
    currentVersionNumber: number;
    documentNumber: string | null;
    issuedDate: string | null;
    expirationDate: string | null;
    originalFileName: string | null;
    contentType: string | null;
    fileSize: number | null;
}

export interface FindDocumentsByOwnerCriteria {
    ownerType: DocumentOwnerType;
    ownerId: number;
    status?: DocumentStatus;
    page: number;
    size: number;
}

export interface AddDocumentVersionMetadata {
    documentNumber?: string;
    issuedDate?: string;
    expirationDate?: string;
    comment?: string;
}

export interface AddDocumentVersionResponse {
    documentId: number;
    documentVersionId: number;
    status: DocumentStatus;
    versionNumber: number;
    documentNumber: string | null;
    issuedDate: string | null;
    expirationDate: string | null;
    originalFileName: string;
    contentType: string;
    fileSize: number;
}

export interface DocumentVersion {
    versionId: number;
    documentId: number;
    versionNumber: number;
    active: boolean;
    documentNumber: string | null;
    issuedDate: string | null;
    expirationDate: string | null;
    comment: string | null;
    originalFileName: string;
    contentType: string;
    fileSize: number;
    createdBy: string;
    createdAt: string;
}

export interface DocumentDetail {
    documentId: number;
    documentTypeId: number;
    documentTypeCode: string;
    documentTypeLabel: string;
    documentTypeDescription: string | null;
    ownerType: DocumentOwnerType;
    ownerId: number;
    title: string;
    status: DocumentStatus;
    activeVersionId: number | null;
    currentVersionNumber: number;
    documentNumber: string | null;
    issuedDate: string | null;
    expirationDate: string | null;
    comment: string | null;
    originalFileName: string | null;
    contentType: string | null;
    fileSize: number | null;
    archivedBy: string | null;
    archivedAt: string | null;
    archiveReason: string | null;
    createdBy: string;
    createdAt: string;
    updatedBy: string | null;
    updatedAt: string | null;
}

export interface ArchiveDocumentRequest {
    reason: string;
}

export interface ArchiveDocumentResponse {
    documentId: number;
    status: DocumentStatus;
    archivedBy: string;
    archivedAt: string;
    archiveReason: string;
}