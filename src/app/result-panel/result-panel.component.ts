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
    this.subscription.unsubscribe();
  }

  haySelecciones(): boolean {
    return Object.keys(this.selecciones).length > 0;
  }

  reset() {
    this.seleccionService.reset();
  }

  onBuscarActividad() {
    console.log('Buscar actividad clickeado');
    this.buscarActividad.emit();
  }
}
