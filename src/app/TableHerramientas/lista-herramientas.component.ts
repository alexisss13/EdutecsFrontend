import { Component, OnInit } from '@angular/core';
import { Tecnica } from '../models/Tecnica';
import { Opcion } from '../models/Opcion';
import { ApiService } from '../api/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lista-herramientas',
  standalone: true,
  imports: [ CommonModule, FormsModule],
  templateUrl: './lista-herramientas.component.html',
  styleUrl: './lista-herramientas.component.css'
})
export class ListaHerramientasComponent implements OnInit {

  tecnicas: Tecnica[] = [];
  carreras: Opcion[] = [];
  paginaActual = 1;
  totalPaginas = 1;
  totalTecnicas = 0;
  pageSize = 5;
  carreraSeleccionada = '';
  busqueda = '';
  paginas: number[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    
    this.apiService.getCarrerasL().subscribe({
      next: (data) => {
        console.log('Carreras recibidas:', data);
        this.carreras = data.results;
      },
      error: (err) => {
        console.error('Error cargando carreras:', err);
        this.carreras = [];
      }
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
  }
}


