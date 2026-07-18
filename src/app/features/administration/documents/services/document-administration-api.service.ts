import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  ConfigureDocumentRequirementPayload, 
  CreateDocumentTypePayload,
  DocumentRequirementView,
  DocumentTypeView,
  IdResponse,
  UpdateDocumentRequirementPayload,
  UpdateDocumentTypePayload
 } from '../models/document-admin.model';
import { DocumentOwnerType } from '../../../../shared/models/document-owner-type.model';

import { API_ENDPOINTS } from '../../../../core/config/api-endpoints';


@Injectable({
  providedIn: 'root',
})
export class DocumentAdministrationApiService {

  //private readonly apiUrl = 'http://localhost:8080/api/document-admin';
  //private readonly apiUrl = `${environment.apiBaseUrl}/api/document-admin`;
  private readonly apiUrl =API_ENDPOINTS.documentAdmin;

  constructor(private readonly http: HttpClient) {}

  findDocumentTypes(ownerType: DocumentOwnerType): Observable<DocumentTypeView[]> {

    const params = new HttpParams().set('ownerType', ownerType);

    return this.http.get<DocumentTypeView[]>(`${this.apiUrl}/document-types`, { params });
  }

  createDocumentType(payload: CreateDocumentTypePayload): Observable<IdResponse> {
    return this.http.post<IdResponse>(`${this.apiUrl}/document-types`, payload);
  }

  updateDocumentType(id: number, payload: UpdateDocumentTypePayload): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/document-types/${id}`, payload);
  }

  findDocumentRequirements(ownerType: DocumentOwnerType): Observable<DocumentRequirementView[]> {
    const params = new HttpParams().set('ownerType', ownerType);

    return this.http.get<DocumentRequirementView[]>(`${this.apiUrl}/document-requirements`, { params });
  }

  configureDocumentRequirement(payload: ConfigureDocumentRequirementPayload): Observable<IdResponse> {
    return this.http.post<IdResponse>(`${this.apiUrl}/document-requirements`, payload);
  }

  updateDocumentRequirement(id: number, payload: UpdateDocumentRequirementPayload): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/document-requirements/${id}`, payload);
  }



}
