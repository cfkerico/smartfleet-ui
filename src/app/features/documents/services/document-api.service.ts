import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '../../../core/config/api-endpoints';

import {
  AddDocumentVersionMetadata,
  AddDocumentVersionResponse,
  ArchiveDocumentRequest,
  ArchiveDocumentResponse,
  CreateDocumentMetadata,
  CreateDocumentResponse,
  DocumentDetail,
  DocumentSummary,
  DocumentVersion,
  FindDocumentsByOwnerCriteria,
  OwnerDocumentView
} from '../models/document.model';

import { PageResult } from '../../../models/page-result.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentApiService {

  private readonly apiUrl = API_ENDPOINTS.documents;

  constructor(private readonly http: HttpClient) {}

  uploadDocument(metadata: CreateDocumentMetadata, file: File): Observable<CreateDocumentResponse> {
    const formData = new FormData();

    formData.append(
      'metadata', 
      new Blob(
        [JSON.stringify(metadata)], 
        { type: 'application/json' }
      ));

      formData.append('file', file);

      return this.http.post<CreateDocumentResponse>(`${this.apiUrl}`, formData);
  }

  findByOwner(criteria: FindDocumentsByOwnerCriteria): Observable<PageResult<DocumentSummary>> {
    let params = new HttpParams()
      .set('ownerType', criteria.ownerType)
      .set('ownerId', criteria.ownerId)
      .set('page', criteria.page)
      .set('size', criteria.size);

    if (criteria.status) {
      params = params.set('status', criteria.status);
    }

    return this.http.get<PageResult<DocumentSummary>>(this.apiUrl, { params });
  }

  addVersion(documentId: number, metadata: AddDocumentVersionMetadata, file: File): Observable<AddDocumentVersionResponse> {
    const formData = new FormData();

    formData.append(
      'metadata',
      new Blob(
        [JSON.stringify(metadata)],
        { type: 'application/json' }
      )
    );
    
    formData.append('file', file);

    return this.http.post<AddDocumentVersionResponse>(`${this.apiUrl}/${documentId}/versions`, formData);
  }

  findDetail(documentId: number): Observable<DocumentDetail> {
    return this.http.get<DocumentDetail>(`${this.apiUrl}/${documentId}`);
  }

  findVersions(documentId: number): Observable<DocumentVersion[]> {
    return this.http.get<DocumentVersion[]>(`${this.apiUrl}/${documentId}/versions`);
  }

  downloadVersion(documentId: number, versionId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}/${documentId}/versions/${versionId}/file`, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  archive(documentId: number, request: ArchiveDocumentRequest): Observable<ArchiveDocumentResponse> {
    return this.http.patch<ArchiveDocumentResponse>(`${this.apiUrl}/${documentId}/archive`, request);
  }


}
