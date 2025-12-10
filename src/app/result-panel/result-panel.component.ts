import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeleccionService } from '../seleccion.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-result-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-panel.component.html',
})
export class ResultPanelComponent implements OnInit, OnDestroy {
  @Output() buscarActividad = new EventEmitter<void>();

  selecciones: { [pregunta: string]: string } = {};
  seleccionesOrdenadas: { pregunta: string; opcion: string }[] = [];
  subscription!: Subscription;

  constructor(private seleccionService: SeleccionService) {}

  ngOnInit() {
    this.subscription = this.seleccionService.selecciones$.subscribe(seleccionesObj => {
      this.selecciones = seleccionesObj;
      this.seleccionesOrdenadas = Object.entries(seleccionesObj).map(([pregunta, opcion]) => ({ pregunta, opcion }));
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  haySelecciones(): boolean {
    return Object.keys(this.selecciones).length > 0;
  }

  // Método agregado para corregir el error
  borrarSeleccion(pregunta: string) {
    // 1. Creamos una copia de las selecciones actuales para no mutar directamente
    const nuevasSelecciones = { ...this.selecciones };
    
    // 2. Eliminamos la selección específica
    delete nuevasSelecciones[pregunta];
    
    // 3. Actualizamos el servicio con el nuevo objeto de selecciones
    this.seleccionService.setSeleccionObj(nuevasSelecciones);
  }

  reset() {
    this.seleccionService.reset();
  }

  onBuscarActividad() {
    console.log('Buscar actividad clickeado');
    this.buscarActividad.emit();
  }
}