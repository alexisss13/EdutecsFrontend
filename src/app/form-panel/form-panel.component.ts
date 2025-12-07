import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeleccionService } from '../seleccion.service';
import { Opcion } from '../models/Opcion';

interface Pregunta {
  icono?: string;
  texto: string;
  opciones?: Opcion[];
  esOtrasOpciones?: boolean;
  esSubOpcion?: boolean;
}

@Component({
  selector: 'app-form-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-panel.component.html',
})
export class FormPanelComponent implements OnInit {
  expandedIndex: number | null = null;
  reemplazoOtrasOpciones = false; 

  preguntas: Pregunta[] = [
    {
      icono: 'assets/carrera.png',
      texto: '¿De qué carrera son tus estudiantes?',
      opciones: [],
    },
    {
      icono: 'assets/momento.png',
      texto: '¿En qué momento de la clase usarás la actividad?',
      opciones: [],
    },
    {
      icono: 'assets/duracion.png',
      texto: '¿Cuánto durará la actividad?',
      opciones: [],
    },
    {
      icono: 'assets/organizacion.png',
      texto: '¿Cómo organizarás a tus estudiantes?',
      opciones: [],
    },
    {
      texto: 'Otras opciones',
      esOtrasOpciones: true,
    }
  ];

  subOpciones: Pregunta[] = [
    {
      icono: 'assets/pensamiento.png',
      texto: '¿Qué pensamiento quieres fomentar?',
      opciones: [],
      esSubOpcion: true,
    },
    {
      icono: 'assets/dificultad.png',
      texto: 'Elige la dificultad',
      opciones: [],
      esSubOpcion: true,
    }
  ];

  // Cambiamos a arreglo para mantener orden
  selectedOpcionesOrdenadas: { pregunta: string; opcion: string }[] = [];

  constructor(private seleccionService: SeleccionService) {}

  ngOnInit(): void {
    // Cargar opciones dinámicas desde la API
    this.cargarCarreras();
    this.cargarMomentos();
    this.cargarDuraciones();
    this.cargarOrganizaciones();
    this.cargarPensamientos();
    this.cargarDificultades();
  }

  private cargarCarreras(): void {
    this.seleccionService.getCarreras().subscribe((carreras) => {
      this.asignarOpciones('¿De qué carrera son tus estudiantes?', carreras);
    });
  }

  getSeleccionParaPregunta(textoPregunta: string): string | null {
    const seleccion = this.selectedOpcionesOrdenadas.find(s => s.pregunta === textoPregunta);
    return seleccion ? seleccion.opcion : null;
  }
  private cargarMomentos(): void {
    this.seleccionService.getMomentos().subscribe(momentos => {
      this.asignarOpciones('¿En qué momento de la clase usarás la actividad?', momentos);
    });
  }

  private cargarDuraciones(): void {
    this.seleccionService.getDuraciones().subscribe(duraciones => {
      this.asignarOpciones('¿Cuánto durará la actividad?', duraciones);
    });
  }

  private cargarOrganizaciones(): void {
    this.seleccionService.getAgrupaciones().subscribe(agrupaciones => {
      this.asignarOpciones('¿Cómo organizarás a tus estudiantes?', agrupaciones);
    });
  }

  private cargarPensamientos(): void {
    this.seleccionService.getPensamientos().subscribe(pensamientos => {
      this.asignarOpciones('¿Qué pensamiento quieres fomentar?', pensamientos);
    });
  }

  private cargarDificultades(): void {
    this.seleccionService.getDificultades().subscribe(dificultades => {
      this.asignarOpciones('Elige la dificultad', dificultades);
    });
  }

  private asignarOpciones(textoPregunta: string, opciones: any): void {
    // Si viene paginado, extrae el array
    let opcionesArray = Array.isArray(opciones) ? opciones : opciones.results;
    if (!Array.isArray(opcionesArray)) opcionesArray = [];
    let pregunta = this.preguntas.find(p => p.texto === textoPregunta);
    if (!pregunta) {
      pregunta = this.subOpciones.find(p => p.texto === textoPregunta);
    }
    if (pregunta) {
      pregunta.opciones = opcionesArray;
      // Forzar nueva referencia para que Angular detecte cambio
      if (pregunta.esSubOpcion) {
        this.subOpciones = [...this.subOpciones];
      } else {
        this.preguntas = [...this.preguntas];
      }
    }
  }



  getPreguntasParaMostrar(): Pregunta[] {
    if (this.reemplazoOtrasOpciones) {
      return [
        ...this.preguntas.filter(p => !p.esOtrasOpciones),
        ...this.subOpciones
      ];
    } else {
      return this.preguntas;
    }
  }

  togglePanel(index: number): void {
    console.log('expandedIndex después de toggle:', this.expandedIndex);
    const preguntasActuales = this.getPreguntasParaMostrar();
    const pregunta = preguntasActuales[index];

    if (pregunta.esOtrasOpciones) {
      this.reemplazoOtrasOpciones = true;
      this.expandedIndex = null;
    } else {
      if (this.expandedIndex === index) {
        this.expandedIndex = null;
      } else {
        this.expandedIndex = index;
      }
    }
  }

  ngAfterViewChecked() {
    // Eliminamos la apertura automática para que subpaneles estén cerrados
  }

  isExpanded(index: number): boolean {
    return this.expandedIndex === index;
  }

  selectOpcion(pregunta: Pregunta, opcion: Opcion): void {
    const index = this.selectedOpcionesOrdenadas.findIndex(sel => sel.pregunta === pregunta.texto);

    if (index !== -1) {
      this.selectedOpcionesOrdenadas[index].opcion = opcion.nombre;
    } else {
      this.selectedOpcionesOrdenadas.push({ pregunta: pregunta.texto, opcion: opcion.nombre });
    }

    // Notificar al servicio con objeto ordenado
    const seleccionesObj = this.selectedOpcionesOrdenadas.reduce((acc, cur) => {
      acc[cur.pregunta] = cur.opcion;
      return acc;
    }, {} as { [key: string]: string });

    this.seleccionService.setSeleccionObj(seleccionesObj);
  }

  isOpcionSeleccionada(pregunta: Pregunta, opcion: Opcion): boolean {
    return this.selectedOpcionesOrdenadas.some(sel => sel.pregunta === pregunta.texto && sel.opcion === opcion.nombre);
  }
}
