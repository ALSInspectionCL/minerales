import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActizComponent } from './actiz.component';

describe('ActizComponent', () => {
  let component: ActizComponent;
  let fixture: ComponentFixture<ActizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActizComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
