import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaReportes } from './mapa-reportes';

describe('MapaReportes', () => {
  let component: MapaReportes;
  let fixture: ComponentFixture<MapaReportes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaReportes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaReportes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
