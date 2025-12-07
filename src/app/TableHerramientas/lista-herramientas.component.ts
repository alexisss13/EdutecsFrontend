import { Component, OnInit } from '@angular/core';
import { Tecnica } from '../models/Tecnica';
import { Opcion } from '../models/Opcion';
import { ApiService } from '../api/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lista-herramientas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-herramientas.component.html',
})
export class ListaHerramientasComponent implements OnInit {

  tecnicas: Tecnica[] = [];
  carreras: Opcion[] = [];
  
  // Variables de Paginación y Filtro
  paginaActual = 1;
  totalPaginas = 1;
  totalTecnicas = 0;
  pageSize = 6; // Ajustado a 6 para que la grilla 3x2 se vea bien
  carreraSeleccionada = '';
  busqueda = '';
  paginas: number[] = [];

  // NUEVO: Variable para el Modal
  tecnicaSeleccionada: Tecnica | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // Carga inicial (igual que antes)
    this.apiService.getCarrerasL().subscribe({
      next: (data) => { this.carreras = data.results; },
      error: () => { this.carreras = []; }
    });
    this.cargarTecnicas();
  }

  cargarTecnicas(): void {
    this.apiService.getTecnicasL(this.paginaActual, this.pageSize, this.carreraSeleccionada, this.busqueda)
      .subscribe({
        next: (data) => {
          this.tecnicas = data.results;
          this.totalTecnicas = data.count;
          this.totalPaginas = Math.ceil(this.totalTecnicas / this.pageSize);
          this.paginas = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
        },
        error: () => {
          this.tecnicas = [];
          this.totalTecnicas = 0;
          this.totalPaginas = 0;
          this.paginas = [];
        }
      });
  }

  onFilterChange(): void {
    this.paginaActual = 1;
    this.cargarTecnicas();
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.cargarTecnicas();
    // Scroll suave hacia arriba al cambiar página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // NUEVO: Métodos para el Modal
  abrirDetalle(tecnica: Tecnica): void {
    this.tecnicaSeleccionada = tecnica;
    // Evitar scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  cerrarDetalle(): void {
    this.tecnicaSeleccionada = null;
    document.body.style.overflow = 'auto';
  }
}