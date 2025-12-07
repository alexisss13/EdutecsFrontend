import { Routes } from '@angular/router';
import { FormPanelComponent } from './form-panel/form-panel.component';
import { ListaHerramientasComponent } from './TableHerramientas/lista-herramientas.component';
import { InstructionsComponent } from './instructions/instructions.component';

export const routes: Routes = [
    // Ruta Raíz (Inicio) -> El formulario de búsqueda
    { path: '', component: FormPanelComponent },
    
    // Ruta Directorio -> La lista de resultados
    { path: 'list', component: ListaHerramientasComponent },
    
    // Ruta Instrucciones -> La página de ayuda
    { path: 'instructions', component: InstructionsComponent },
    
    // Redirección por defecto (seguridad)
    { path: '**', redirectTo: '' }
];