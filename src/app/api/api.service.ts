import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Opcion } from '../models/Opcion';
import { Tecnica } from '../models/Tecnica';
import { Paginacion } from '../models/Paginacion';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // CAMBIO: Agregamos page_size=100 a todos los catálogos para traer todas las opciones

  getCarreras(): Observable<any> {
    const params = new HttpParams().set('page_size', '100');
    return this.http.get<any>(this.apiUrl + 'carreras/', { params });
  }

  getMomentos(): Observable<any> {
    const params = new HttpParams().set('page_size', '100');
    return this.http.get<any>(this.apiUrl + 'momentos/', { params });
  }

  getDuraciones(): Observable<any> {
    const params = new HttpParams().set('page_size', '100');
    return this.http.get<any>(this.apiUrl + 'duraciones/', { params });
  }

  getAgrupaciones(): Observable<any> {
    const params = new HttpParams().set('page_size', '100');
    return this.http.get<any>(this.apiUrl + 'agrupaciones/', { params });
  }

  getPensamientos(): Observable<any> {
    const params = new HttpParams().set('page_size', '100');
    return this.http.get<any>(this.apiUrl + 'pensamientos/', { params });
  }

  getDificultades(): Observable<any> {
    const params = new HttpParams().set('page_size', '100');
    return this.http.get<any>(this.apiUrl + 'dificultades/', { params });
  }

  // Métodos de búsqueda y filtrado (se mantienen igual o ajustas según necesidad)

  getTecnicasFiltradas(filters: { [key: string]: string }, page = 1, pageSize = 5): Observable<{ count: number; results: Tecnica[] }> {
    let params = new HttpParams()
      .set('page', page)
      .set('page_size', pageSize);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params = params.set(key, value);
      }
    });

    return this.http.get<{ count: number; results: Tecnica[] }>(this.apiUrl + 'tecnicas/', { params });
  }

  getTecnicasL(page = 1, pageSize = 15, carrera?: string, search?: string): Observable<{ count: number; results: Tecnica[] }> {
    let params = new HttpParams()
      .set('page', page)
      .set('page_size', pageSize);
    if (carrera) params = params.set('carreras__nombre', carrera);
    if (search) params = params.set('search', search);
    return this.http.get<{ count: number; results: Tecnica[] }>(this.apiUrl + 'tecnicas/', { params });
  }

  // Llama al endpoint nuevo que devuelve ARRAY directo (Tecnica[]), sin paginación
  getTecnicasExportar(carrera?: string, search?: string): Observable<Tecnica[]> {
    let params = new HttpParams(); // Sin page ni page_size
    if (carrera) params = params.set('carreras__nombre', carrera);
    if (search) params = params.set('search', search);
    
    return this.http.get<Tecnica[]>(this.apiUrl + 'tecnicas/exportar/', { params });
  }

  getCarrerasL(): Observable<Paginacion<Opcion>> {
    return this.http.get<Paginacion<Opcion>>(this.apiUrl + 'carreras/');
  }
}