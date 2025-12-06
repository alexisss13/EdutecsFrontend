import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Opcion } from '../models/Opcion';
import { Tecnica } from '../models/Tecnica';
import { Paginacion } from '../models/Paginacion';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  apiUrl = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient) { }

  getCarreras(): Observable<Opcion[]> {
    return this.http.get<Opcion[]>(this.apiUrl + 'carreras/');
  }

  getMomentos(): Observable<Opcion[]> {
    return this.http.get<Opcion[]>(this.apiUrl + 'momentos/');
  }

  getDuraciones(): Observable<Opcion[]> {
    return this.http.get<Opcion[]>(this.apiUrl + 'duraciones/');
  }

  getAgrupaciones(): Observable<Opcion[]> {
    return this.http.get<Opcion[]>(this.apiUrl + 'agrupaciones/');
  }

  getPensamientos(): Observable<Opcion[]> {
    return this.http.get<Opcion[]>(this.apiUrl + 'pensamientos/');
  }

  getDificultades(): Observable<Opcion[]> {
    return this.http.get<Opcion[]>(this.apiUrl + 'dificultades/');
  }

  getTecnicasFiltradas(filters: { [key: string]: string }, page = 1, pageSize = 5): Observable<{ count: number; results: Tecnica[] }> {
    let params = new HttpParams()
      .set('page', page)
      .set('page_size', pageSize);
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      // Ajusta las claves según los parámetros que espera tu API
      params = params.set(key, value);
    }
  });

  return this.http.get<{ count: number; results: Tecnica[] }>(this.apiUrl + 'tecnicas/', { params });
}


  getTecnicasL(page = 1, pageSize = 5, carrera?: string, search?: string): Observable<{ count: number; results: Tecnica[] }> {
    let params = new HttpParams()
      .set('page', page)
      .set('page_size', pageSize);
    if (carrera) params = params.set('carreras__nombre', carrera);
    if (search) params = params.set('search', search);
    return this.http.get<{ count: number; results: Tecnica[] }>(this.apiUrl + 'tecnicas/', { params });
  }

  getCarrerasL(): Observable<Paginacion<Opcion>> {
  return this.http.get<Paginacion<Opcion>>(this.apiUrl + 'carreras/');
}



}
