import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api/api.service';
import { Opcion } from './models/Opcion';

@Injectable({
  providedIn: 'root'
})
export class SeleccionService {
  private _selecciones = new BehaviorSubject<{ [pregunta: string]: string }>({});
  selecciones$ = this._selecciones.asObservable();

  constructor(private apiService: ApiService) {}

  // Métodos para obtener datos desde la API a través de ApiService

  getCarreras(): Observable<Opcion[]> {
    return this.apiService.getCarreras();
  }

  getMomentos(): Observable<Opcion[]> {
    return this.apiService.getMomentos();
  }

  getDuraciones(): Observable<Opcion[]> {
    return this.apiService.getDuraciones();
  }

  getAgrupaciones(): Observable<Opcion[]> {
    return this.apiService.getAgrupaciones();
  }

  getPensamientos(): Observable<Opcion[]> {
    return this.apiService.getPensamientos();
  }

  getDificultades(): Observable<Opcion[]> {
    return this.apiService.getDificultades();
  }

  // Métodos para manejar selecciones locales

  setSeleccion(pregunta: string, opcion: string) {
    const actuales = { ...this._selecciones.value, [pregunta]: opcion };
    this._selecciones.next(actuales);
  }

  setSeleccionObj(selecciones: { [pregunta: string]: string }) {
    this._selecciones.next(selecciones);
  }

  reset() {
    this._selecciones.next({});
  }
}
