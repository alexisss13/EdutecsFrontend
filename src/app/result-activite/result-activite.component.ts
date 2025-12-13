import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tecnica } from '../models/Tecnica';
import { ApiService } from '../api/api.service';
import { SeleccionService } from '../seleccion.service';

// Importaciones para PDF
import jsPDF from 'jspdf';

@Component({
  selector: 'app-result-activite',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-activite.component.html',
})
export class ResultActiviteComponent implements OnInit, OnDestroy {
  @Output() nuevaBusqueda = new EventEmitter<void>();

  tecnicas: Tecnica[] = [];
  panelAbierto: boolean[] = [];
  seleccionesUsuario: { [pregunta: string]: string } = {};

  // Variables para Spinner y Timeout (Carga de resultados)
  loading: boolean = false;
  mostrarMensajeDemora: boolean = false;
  private timerDemora: any;

  // Variable para Spinner PDF (Descarga) <--- NUEVO
  loadingPdf: boolean = false;

  // Colores corporativos (RGB)
  private readonly COLOR_PRIMARY: [number, number, number] = [0, 178, 227];
  private readonly COLOR_GRAY_800: [number, number, number] = [31, 41, 55];
  private readonly COLOR_GRAY_500: [number, number, number] = [107, 114, 128];
  private readonly COLOR_GRAY_200: [number, number, number] = [229, 231, 235];

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

  ngOnDestroy(): void {
    this.limpiarTimer();
  }

  onNuevaBusqueda() {
    this.nuevaBusqueda.emit();
  }

  buscarTecnicasCoincidentes(): void {
    this.loading = true;
    this.mostrarMensajeDemora = false;
    this.limpiarTimer();
    this.tecnicas = []; 

    this.timerDemora = setTimeout(() => {
        if (this.loading) {
            this.mostrarMensajeDemora = true;
        }
    }, 6000);

    const filtrosApi = {
      'carreras__nombre': this.seleccionesUsuario['¿De qué carrera son tus estudiantes?'] || '',
      'momentos__nombre': this.seleccionesUsuario['¿En qué momento de la clase usarás la actividad?'] || '',
      'duraciones__nombre': this.seleccionesUsuario['¿Cuánto durará la actividad?'] || '',
      'agrupaciones__nombre': this.seleccionesUsuario['¿Cómo organizarás a tus estudiantes?'] || '',
      'pensamientos__nombre': this.seleccionesUsuario['¿Qué pensamiento quieres fomentar?'] || '',
      'dificultades__nombre': this.seleccionesUsuario['Elige la dificultad'] || '',
    };

    this.apiService.getTecnicasFiltradas(filtrosApi).subscribe({
      next: (data) => {
        this.tecnicas = data.results;
        this.inicializarPaneles();
        this.finalizarCarga();
      },
      error: (err) => {
        console.error('Error al obtener técnicas:', err);
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
    if (this.timerDemora) {
      clearTimeout(this.timerDemora);
      this.timerDemora = null;
    }
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

  // --- LÓGICA DE PDF ---
  async descargarPDF() {
    // 1. Activar carga
    this.loadingPdf = true;

    try {
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
    
        } catch (e) {
            console.warn('No se pudo cargar el logo Tecsup.png', e);
        }
    
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(...this.COLOR_GRAY_800);
        doc.text('Edutecs', textoX, 19); 
    
        doc.setFont('helvetica', 'bold'); 
        doc.setFontSize(9);
        doc.setTextColor(...this.COLOR_PRIMARY);
        doc.text('DOCENTES', textoX, 23); 
    
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...this.COLOR_GRAY_500);
        const fecha = new Date().toLocaleDateString();
        doc.text(fecha, anchoPagina - margenX, 20, { align: 'right' });
    
        cursorY += 20; 
    
        doc.setFillColor(249, 250, 251); 
        doc.setDrawColor(...this.COLOR_GRAY_200);
        doc.roundedRect(margenX, cursorY, anchoUtil, 30, 3, 3, 'FD');
        
        let filtroY = cursorY + 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...this.COLOR_GRAY_800);
        doc.text('Filtros seleccionados:', margenX + 5, filtroY);
        filtroY += 6;
    
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...this.COLOR_GRAY_500);
    
        const filtros = Object.entries(this.seleccionesUsuario);
        let filtrosTexto = "";
    
        filtros.forEach(([pregunta, respuesta]) => {
            if (!respuesta) return;
            let label = pregunta;
            if (pregunta.includes('carrera')) label = 'Carrera';
            else if (pregunta.includes('momento')) label = 'Momento';
            else if (pregunta.includes('durará')) label = 'Duración';
            else if (pregunta.includes('organizarás')) label = 'Agrupación';
            else if (pregunta.includes('pensamiento')) label = 'Pensamiento';
            else if (pregunta.includes('dificultad')) label = 'Dificultad';
            
            filtrosTexto += `${label}: ${respuesta}  |  `;
        });
    
        if (filtrosTexto.endsWith('  |  ')) filtrosTexto = filtrosTexto.slice(0, -5);
        
        const splitFiltros = doc.splitTextToSize(filtrosTexto, anchoUtil - 10);
        doc.text(splitFiltros, margenX + 5, filtroY);
    
        cursorY += 40; 
    
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...this.COLOR_GRAY_800);
        doc.text('Estrategias Recomendadas', margenX, cursorY);
        cursorY += 10;
    
        this.tecnicas.forEach((tecnica, index) => {
            if (cursorY > 250) {
                doc.addPage();
                cursorY = 20;
            }
    
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
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
            const descripcionLines = doc.splitTextToSize(tecnica.descripcion, anchoUtil);
            doc.text(descripcionLines, margenX, cursorY);
            cursorY += (descripcionLines.length * 4) + 4; 
    
            if (tecnica.explicacion) {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(9);
                doc.setTextColor(...this.COLOR_GRAY_800);
                doc.text('Cómo funciona:', margenX, cursorY);
                cursorY += 4;
    
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(...this.COLOR_GRAY_500); 
                
                const explicacionLines = doc.splitTextToSize(tecnica.explicacion, anchoUtil);
                doc.text(explicacionLines, margenX, cursorY);
                cursorY += (explicacionLines.length * 4) + 4;
            }
    
            cursorY += 2;
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
    
        doc.save('Estrategias_Edutecs.pdf');

    } catch (error) {
        console.error('Error generando el PDF', error);
    } finally {
        // 2. Apagar carga siempre, aunque falle
        this.loadingPdf = false;
    }
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
        } else {
            reject('No se pudo crear contexto canvas');
        }
      };
      img.onerror = (e) => reject(e);
    });
  }
}