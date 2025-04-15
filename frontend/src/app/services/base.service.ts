import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { enviroment } from '../../../enviroment';
import { Entity } from '../shared/entities/Entity';

// Interface definitions matching your backend types

export interface PaginationParams {
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  protected apiPath!: string;

  constructor(
    protected http: HttpClient
  ) {
  }

  create(entity: any): Observable<any> {
    return this.http.post<any>(enviroment.API_URL+ this.apiPath, entity);
  }

  findAll(): Observable<any> {
    return this.http.get<any>(enviroment.API_URL+ this.apiPath);
  }

  findById(id: string): Observable<any> {
    return this.http.get<any>(`${enviroment.API_URL+ this.apiPath}/${id}`);
  }

  update(entity: any): Observable<any> {
    return this.http.put<any>(`${enviroment.API_URL+ this.apiPath}/${entity._id}`, entity);
  }

  remove(id: string): Observable<any> {
    return this.http.delete<any>(`${enviroment.API_URL+ this.apiPath}/${id}`);
  }

}
