import { Routes } from '@angular/router';
import { ListaHerramientasComponent } from './TableHerramientas/lista-herramientas.component';

export class AppComponent {
   mostrarListado = false;
}

export const routes: Routes = [
  { path: 'lista-herramientas', component: ListaHerramientasComponent },
  // Si tienes una ruta raíz, déjala vacía para que el app.component maneje la vista principal
  { path: '', redirectTo: '', pathMatch: 'full' }
];