import { Component, OnInit, OnDestroy } from '@angular/core';
import { Tecnica } from '../models/Tecnica';
import { Opcion } from '../models/Opcion';
import { ApiService } from '../api/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf'; 

@Component({
  selector: 'app-lista-herramientas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-herramientas.component.html',
})
export class ListaHerramientasComponent implements OnInit, OnDestroy {

  tecnicas: Tecnica[] = [];
  carreras: Opcion[] = [];
  
  // Variables de Paginación y Filtro
  paginaActual = 1;
  totalPaginas = 1;
  totalTecnicas = 0;
  pageSize = 6; 
  carreraSeleccionada = '';
  busqueda = '';
  paginas: number[] = [];

  // Modal
  tecnicaSeleccionada: Tecnica | null = null;

  // Variables Spinner General (Carga de página)
  loading: boolean = false;
  mostrarMensajeDemora: boolean = false;
  private timerDemora: any;

  // Variable Spinner PDF (Carga de descarga) <--- NUEVO
  loadingPdf: boolean = false;

  // Estilos PDF
  private readonly COLOR_PRIMARY: [number, number, number] = [0, 178, 227]; 
  private readonly COLOR_GRAY_800: [number, number, number] = [31, 41, 55]; 
  private readonly COLOR_GRAY_500: [number, number, number] = [107, 114, 128]; 
  private readonly COLOR_GRAY_200: [number, number, number] = [229, 231, 235]; 

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getCarrerasL().subscribe({
      next: (data: any) => { 
        if (Array.isArray(data)) { this.carreras = data; } 
        else if (data && data.results) { this.carreras = data.results; } 
        else { this.carreras = []; }
      },
      error: () => { this.carreras = []; }
    });
    this.cargarTecnicas();
  }

  ngOnDestroy(): void { this.limpiarTimer(); }

  cargarTecnicas(): void {
    this.loading = true;
    this.mostrarMensajeDemora = false;
    this.limpiarTimer();
    this.tecnicas = []; 

    this.timerDemora = setTimeout(() => {
        if (this.loading) this.mostrarMensajeDemora = true;
    }, 6000);

    this.apiService.getTecnicasL(this.paginaActual, this.pageSize, this.carreraSeleccionada, this.busqueda)
      .subscribe({
        next: (data) => {
          this.tecnicas = data.results;
          this.totalTecnicas = data.count;
          this.totalPaginas = Math.ceil(this.totalTecnicas / this.pageSize);
          this.paginas = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
          this.finalizarCarga();
        },
        error: () => {
          this.tecnicas = [];
          this.totalTecnicas = 0;
          this.finalizarCarga();
        }
      });
  }

  private finalizarCarga(): void {
    this.loading = false;
    this.mostrarMensajeDemora = false;
    this.limpiarTimer();
  }

  private limpiarTimer(): void {
    if (this.timerDemora) { clearTimeout(this.timerDemora); this.timerDemora = null; }
  }

  onFilterChange(): void {
    this.paginaActual = 1;
    this.cargarTecnicas();
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.cargarTecnicas();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- LÓGICA DE PDF ---

  async iniciarDescargaPDF() {
    const tieneFiltros = this.busqueda.trim() !== '' || this.carreraSeleccionada !== '';
    
    if (!tieneFiltros) {
      const confirmar = confirm(`¿Deseas descargar el catálogo completo?\n\nSe generará un PDF con todas las técnicas disponibles.`);
      if (!confirmar) return;
    }

    // Activar estado de carga del PDF
    this.loadingPdf = true; 

    // Usamos el endpoint sin paginación
    this.apiService.getTecnicasExportar(this.carreraSeleccionada, this.busqueda).subscribe({
      next: async (data: Tecnica[]) => {
        if (data && data.length > 0) {
          await this.generarPDF(data);
        } else {
          alert('No hay datos para generar el reporte.');
        }
        this.loadingPdf = false; // Desactivar al terminar
      },
      error: () => {
        alert('Error al obtener los datos para el PDF.');
        this.loadingPdf = false; // Desactivar al fallar
      }
    });
  }

  async generarPDF(datosReporte: Tecnica[]) {
    // ... (Tu lógica de generación de PDF se mantiene igual) ...
    const doc = new jsPDF();
    const margenX = 20;
    let cursorY = 20; 
    const anchoPagina = doc.internal.pageSize.width;
    const anchoUtil = anchoPagina - (margenX * 2);

    const logoAncho = 35; 
    const logoAlto = 10;
    const separacion = 5;
    const lineaX = margenX + logoAncho + separacion; 
    const textoX = lineaX + separacion; 

    try {
        const logoData = await this.loadImage('assets/Tecsup.png'); 
        doc.addImage(logoData, 'PNG', margenX, 15, logoAncho, logoAlto); 
        doc.setDrawColor(...this.COLOR_GRAY_200);
        doc.setLineWidth(0.5);
        doc.line(lineaX, 15, lineaX, 25); 
    } catch (e) { console.warn('Logo no cargado'); }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...this.COLOR_GRAY_800);
    doc.text('Edutecs', textoX, 19); 

    doc.setFont('helvetica', 'bold'); 
    doc.setFontSize(9);
    doc.setTextColor(...this.COLOR_PRIMARY);
    doc.text('DOCENTES', textoX, 23); 

    const fecha = new Date().toLocaleDateString();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...this.COLOR_GRAY_500);
    doc.text(fecha, anchoPagina - margenX, 20, { align: 'right' });

    cursorY += 20; 

    doc.setFillColor(249, 250, 251); 
    doc.setDrawColor(...this.COLOR_GRAY_200);
    doc.roundedRect(margenX, cursorY, anchoUtil, 25, 3, 3, 'FD');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.COLOR_GRAY_800);
    doc.text('Filtros del Reporte:', margenX + 5, cursorY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...this.COLOR_GRAY_500);

    let textoFiltros = '';
    textoFiltros += this.carreraSeleccionada ? `Carrera: ${this.carreraSeleccionada}  |  ` : `Carrera: Todas  |  `;
    textoFiltros += this.busqueda ? `Búsqueda: "${this.busqueda}"` : `Búsqueda: General`;

    doc.text(textoFiltros, margenX + 5, cursorY + 16);
    cursorY += 35; 

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.COLOR_GRAY_800);
    doc.text(`Resultados (${datosReporte.length})`, margenX, cursorY);
    cursorY += 10;

    datosReporte.forEach((tecnica, index) => {
        if (cursorY > 250) {
            doc.addPage();
            cursorY = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...this.COLOR_PRIMARY);
        doc.text(`${index + 1}. ${tecnica.nombre}`, margenX, cursorY);
        cursorY += 6;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...this.COLOR_GRAY_800);

        const getStr = (arr?: string[]) => arr && arr.length > 0 ? arr.join(', ') : '-';

        const meta1 = `Duración: ${getStr(tecnica.duraciones)}   |   Dificultad: ${getStr(tecnica.dificultades)}   |   Momento: ${getStr(tecnica.momentos)}`;
        doc.text(meta1, margenX, cursorY);
        cursorY += 4;

        const meta2 = `Agrupación: ${getStr(tecnica.agrupaciones)}   |   Pensamiento: ${getStr(tecnica.pensamientos)}`;
        doc.text(meta2, margenX, cursorY);
        cursorY += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...this.COLOR_GRAY_800);
        const descLines = doc.splitTextToSize(tecnica.descripcion, anchoUtil);
        doc.text(descLines, margenX, cursorY);
        cursorY += (descLines.length * 4) + 4;

        if (tecnica.explicacion) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(...this.COLOR_GRAY_800);
            doc.text('Cómo funciona:', margenX, cursorY);
            cursorY += 4;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...this.COLOR_GRAY_500); 
            const expLines = doc.splitTextToSize(tecnica.explicacion, anchoUtil);
            doc.text(expLines, margenX, cursorY);
            cursorY += (expLines.length * 4) + 4;
        }

        doc.setDrawColor(...this.COLOR_GRAY_200);
        doc.setLineWidth(0.1);
        doc.line(margenX, cursorY, margenX + anchoUtil, cursorY);
        cursorY += 8;
    });

    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${totalPages} - Generado por Edutecs`, anchoPagina / 2, 285, { align: 'center' });
    }

    doc.save('Listado_Herramientas_Edutecs.pdf');
  }

  private loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        } else resolve('');
      };
      img.onerror = () => resolve('');
    });
  }

  abrirDetalle(tecnica: Tecnica): void {
    this.tecnicaSeleccionada = tecnica;
    document.body.style.overflow = 'hidden';
  }

  cerrarDetalle(): void {
    this.tecnicaSeleccionada = null;
    document.body.style.overflow = 'auto';
  }
}