import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs'; // <--- Importante para la suscripción
import { SeleccionService } from '../seleccion.service';
import { Opcion } from '../models/Opcion';
// Importaciones de tus componentes
import { InstructionsComponent } from '../instructions/instructions.component';
import { ResultPanelComponent } from '../result-panel/result-panel.component';
import { ResultActiviteComponent } from '../result-activite/result-activite.component';

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
  imports: [
    CommonModule, 
    InstructionsComponent, 
    ResultPanelComponent, 
    ResultActiviteComponent
  ],
  templateUrl: './form-panel.component.html',
})
export class FormPanelComponent implements OnInit, OnDestroy { // <--- Implementar OnDestroy
  
  // Variable para controlar si mostramos el formulario o los resultados
  mostrarResultados = false;

  expandedIndex: number | null = null;
  reemplazoOtrasOpciones = false; 
  
  // Suscripción para escuchar cambios externos (como el botón Reset)
  private subscription: Subscription = new Subscription();

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

  selectedOpcionesOrdenadas: { pregunta: string; opcion: string }[] = [];

  constructor(private seleccionService: SeleccionService) {}

  ngOnInit(): void {
    this.cargarCarreras();
    this.cargarMomentos();
    this.cargarDuraciones();
    this.cargarOrganizaciones();
    this.cargarPensamientos();
    this.cargarDificultades();

    // --- ESCUCHAR CAMBIOS DEL SERVICIO ---
    // Esto hace que si el ResultPanel limpia todo, este componente se entere y desmarque visualmente.
    this.subscription.add(
      this.seleccionService.selecciones$.subscribe(selecciones => {
        // Convertimos el objeto { pregunta: respuesta } de vuelta al array que usa este componente
        this.selectedOpcionesOrdenadas = Object.entries(selecciones).map(([pregunta, opcion]) => ({
          pregunta,
          opcion
        }));
      })
    );
  }

  ngOnDestroy(): void {
    // Importante: Desuscribirse para evitar fugas de memoria
    this.subscription.unsubscribe();
  }

  // --- MÉTODOS PARA CONTROL DE VISTAS ---

  onBuscar(): void {
    this.mostrarResultados = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onResetBusqueda(): void {
    this.mostrarResultados = false;
  }

  // --- MÉTODOS DE CARGA DE DATOS ---

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
    let opcionesArray = Array.isArray(opciones) ? opciones : opciones.results;
    if (!Array.isArray(opcionesArray)) opcionesArray = [];
    let pregunta = this.preguntas.find(p => p.texto === textoPregunta);
    if (!pregunta) {
      pregunta = this.subOpciones.find(p => p.texto === textoPregunta);
    }
    if (pregunta) {
      pregunta.opciones = opcionesArray;
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

  ngAfterViewChecked() {}

  isExpanded(index: number): boolean {
    return this.expandedIndex === index;
  }

  selectOpcion(pregunta: Pregunta, opcion: Opcion): void {
    // Actualizamos el array local
    const index = this.selectedOpcionesOrdenadas.findIndex(sel => sel.pregunta === pregunta.texto);

    if (index !== -1) {
      this.selectedOpcionesOrdenadas[index].opcion = opcion.nombre;
    } else {
      this.selectedOpcionesOrdenadas.push({ pregunta: pregunta.texto, opcion: opcion.nombre });
    }

    // Convertimos a objeto y enviamos al servicio
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