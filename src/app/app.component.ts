import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';

import { HeaderComponent } from './header/header.component';
import { TabsComponent } from './tabs/tabs.component';
import { InstructionsComponent } from './instructions/instructions.component';
import { FormPanelComponent } from './form-panel/form-panel.component';
import { ResultPanelComponent } from './result-panel/result-panel.component';
import { ResultActiviteComponent } from './result-activite/result-activite.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NgIf,
    HeaderComponent,
    TabsComponent,
    InstructionsComponent,
    FormPanelComponent,
    ResultPanelComponent,
    ResultActiviteComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  mostrarResultado = false;
  mostrarInstrucciones = true;
  mostrarListado = false;

  private actualizarEstadoSegunRuta(url: string) {
  if (url === '/lista-herramientas') {
    this.mostrarListado = true;
    this.mostrarResultado = false;
    this.mostrarInstrucciones = false;
  } else if (url === '/' || url === '/kit-herramientas') {
    this.mostrarListado = false;
    this.mostrarResultado = false;
    this.mostrarInstrucciones = true;
  } else {
    // Otros casos si los hay
    this.mostrarListado = false;
    this.mostrarResultado = false;
    this.mostrarInstrucciones = false;
  }
}

constructor(private router: Router) {
  this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      this.actualizarEstadoSegunRuta(event.url);
    }
  });
}


  onBuscarActividad() {
    this.mostrarResultado = true;
    this.mostrarInstrucciones = false;
  }

  onNuevaBusqueda() {
    this.mostrarResultado = false;
    this.mostrarInstrucciones = true;
  }
}
