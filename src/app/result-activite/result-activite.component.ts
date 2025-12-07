import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tecnica } from '../models/Tecnica';
import { ApiService } from '../api/api.service';
import { SeleccionService } from '../seleccion.service';

@Component({
  selector: 'app-result-activite',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-activite.component.html',
})
export class ResultActiviteComponent {
  @Output() nuevaBusqueda = new EventEmitter<void>();

  tecnicas: Tecnica[] = [];
  panelAbierto: boolean[] = [];
  seleccionesUsuario: { [pregunta: string]: string } = {};

  constructor(
    private seleccionService: SeleccionService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.seleccionService.selecciones$.subscribe(selecciones => {
      this.seleccionesUsuario = selecciones;
      this.buscarTecnicasCoincidentes();
    });
  }

  onNuevaBusqueda() {
    this.nuevaBusqueda.emit();
  }

  buscarTecnicasCoincidentes(): void {
    const filtrosApi = {
      'carreras__nombre': this.seleccionesUsuario['¿De qué carrera son tus estudiantes?'] || '',
      'momentos__nombre': this.seleccionesUsuario['¿En qué momento de la clase usarás la actividad?'] || '',
      'duraciones__nombre': this.seleccionesUsuario['¿Cuánto durará la actividad?'] || '',
      'agrupaciones__nombre': this.seleccionesUsuario['¿Cómo organizarás a tus estudiantes?'] || '',
      'pensamientos__nombre': this.seleccionesUsuario['¿Qué pensamiento quieres fomentar?'] || '',
      'dificultades__nombre': this.seleccionesUsuario['Elige la dificultad'] || '',
    };

    this.apiService.getTecnicasFiltradas(filtrosApi).subscribe(data => {
      this.tecnicas = data.results;
      this.inicializarPaneles();
    });
  }

  inicializarPaneles(): void {
    this.panelAbierto = new Array(this.tecnicas.length).fill(false);
  }

  togglePanel(index: number): void {
    this.panelAbierto[index] = !this.panelAbierto[index];
  }

  getIconoTecnica(index: number): string {
    const iconos = [
      'assets/icono-pedagogica.png',
      'assets/icono-idea.png',
      'assets/icono-listo.png',
    ];
    return iconos[index % iconos.length];
  }
}
