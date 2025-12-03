import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleCompositoComponent } from './detalle-composito.component';

describe('DetalleCompositoComponent', () => {
  let component: DetalleCompositoComponent;
  let fixture: ComponentFixture<DetalleCompositoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleCompositoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleCompositoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
