import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstibaComponent } from './estiba.component';

describe('EstibaComponent', () => {
  let component: EstibaComponent;
  let fixture: ComponentFixture<EstibaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstibaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstibaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
