import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnguloComponent } from './angulo.component';

describe('AnguloComponent', () => {
  let component: AnguloComponent;
  let fixture: ComponentFixture<AnguloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnguloComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnguloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
