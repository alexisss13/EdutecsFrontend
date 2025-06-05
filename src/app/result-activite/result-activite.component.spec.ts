import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultActiviteComponent } from './result-activite.component';

describe('ResultActiviteComponent', () => {
  let component: ResultActiviteComponent;
  let fixture: ComponentFixture<ResultActiviteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultActiviteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultActiviteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
