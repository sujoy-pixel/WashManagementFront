import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MascocommercialComponent } from './mascocommercial.component';

describe('MascocommercialComponent', () => {
  let component: MascocommercialComponent;
  let fixture: ComponentFixture<MascocommercialComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MascocommercialComponent]
    });
    fixture = TestBed.createComponent(MascocommercialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
