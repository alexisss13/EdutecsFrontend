import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaHerramientasComponent } from './lista-herramientas.component';

describe('ListaHerramientasComponent', () => {
  let component: ListaHerramientasComponent;
  let fixture: ComponentFixture<ListaHerramientasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaHerramientasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaHerramientasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
