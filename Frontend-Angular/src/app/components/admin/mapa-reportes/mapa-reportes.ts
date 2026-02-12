import { AfterViewInit, OnInit, Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import * as L from 'leaflet';

interface Reporte {
  id: number;
  tipo: string;
  descripcion: string;
  latitud: number;
  longitud: number;
  fecha: Date;
  estado: 'pendiente' | 'en_proceso' | 'resuelto';
  agente?: string;
}

@Component({
  selector: 'app-mapa-reportes',
  standalone: true,
  templateUrl: './mapa-reportes.html',
  styleUrls: ['./mapa-reportes.css'],
  imports: [RouterModule]
})
export class MapaReportesComponent implements AfterViewInit, OnInit {

  private map!: L.Map;
  private markersLayer = L.layerGroup();
  private intervaloAutomatico!: any;

  private reportes: Reporte[] = [
    {
      id: 1,
      tipo: 'Vehículo mal estacionado',
      descripcion: 'Vehículo bloqueando paso peatonal',
      latitud: 4.5339,
      longitud: -75.6811,
      fecha: new Date(),
      estado: 'pendiente'
    },
    {
      id: 2,
      tipo: 'Accidente leve',
      descripcion: 'Choque entre motocicleta y automóvil',
      latitud: 4.5355,
      longitud: -75.6820,
      fecha: new Date(),
      estado: 'en_proceso',
      agente: 'Unidad 204'
    }
  ];

  constructor(private router: Router) {}

  // ======================================
  // 🚀 INICIO AUTOMÁTICO
  // ======================================

  ngOnInit(): void {
    this.intervaloAutomatico = setInterval(() => {
      this.generarReporteAutomatico();
    }, 10000);
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.loadReportes();
  }

  // ======================================
  // 🔢 CONTADORES DINÁMICOS
  // ======================================

  get totalPendientes(): number {
    return this.reportes.filter(r => r.estado === 'pendiente').length;
  }

  get totalEnProceso(): number {
    return this.reportes.filter(r => r.estado === 'en_proceso').length;
  }

  get totalResueltos(): number {
    return this.reportes.filter(r => r.estado === 'resuelto').length;
  }

  // ======================================
  // 🗺 MAPA
  // ======================================

  private initMap(): void {
    this.map = L.map('map', {
      center: [4.5339, -75.6811],
      zoom: 15
    });

    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Tiles © Esri' }
    );

    satelliteLayer.addTo(this.map);
    this.markersLayer.addTo(this.map);

    this.mostrarUbicacionActual();
  }

  private mostrarUbicacionActual(): void {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      this.map.setView([lat, lng], 17);

      L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: '#007bff',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1
      })
      .addTo(this.map)
      .bindPopup('<strong>Estás aquí</strong>');
    });
  }

  private loadReportes(): void {
    this.clearMarkers();
    this.reportes.forEach(r => this.addMarker(r));
  }

  private addMarker(reporte: Reporte): void {

    const marker = L.circleMarker(
      [reporte.latitud, reporte.longitud],
      {
        radius: 8,
        fillColor: this.getColorPorEstado(reporte.estado),
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1
      }
    );

    let estadoTexto = '';
    let agenteTexto = '';

    switch (reporte.estado) {
      case 'pendiente':
        estadoTexto = 'Pendiente de atención';
        agenteTexto = 'Pendiente de asignación';
        break;

      case 'en_proceso':
        estadoTexto = 'En atención';
        agenteTexto = reporte.agente || 'Asignando unidad...';
        break;

      case 'resuelto':
        estadoTexto = 'Caso cerrado';
        agenteTexto = `Atendido por ${reporte.agente}`;
        break;
    }

    marker.bindPopup(`
      <div style="font-family: Arial; min-width:240px;">
        <h3 style="margin-bottom:5px;">${reporte.tipo}</h3>
        <p>${reporte.descripcion}</p>

        <hr style="margin:8px 0;">

        <strong>Ubicación exacta:</strong><br>
        ${reporte.latitud.toFixed(5)}, ${reporte.longitud.toFixed(5)}<br><br>

        <strong>Fecha y hora:</strong><br>
        ${reporte.fecha.toLocaleString()}<br><br>

        <strong>Estado:</strong> ${estadoTexto}<br>
        <strong>Unidad asignada:</strong> ${agenteTexto}
      </div>
    `);

    marker.addTo(this.markersLayer);
  }

  private getColorPorEstado(estado: string): string {
    switch (estado) {
      case 'pendiente': return '#ffc107';
      case 'en_proceso': return '#fd7e14';
      case 'resuelto': return '#28a745';
      default: return '#6c757d';
    }
  }

  private clearMarkers(): void {
    this.markersLayer.clearLayers();
  }

  navegarADetalle(id: number): void {
    this.router.navigate(['/admin/reporte', id]);
  }

  // ======================================
  // 🔄 GENERACIÓN AUTOMÁTICA
  // ======================================

  private generarReporteAutomatico(): void {

    const estados: Reporte['estado'][] = ['pendiente', 'en_proceso', 'resuelto'];
    const estadoSeleccionado = estados[Math.floor(Math.random() * estados.length)];

    const agentes = [
      'Agente Martínez',
      'Oficial Ramírez',
      'Unidad 204',
      'Unidad 315'
    ];

    let agenteAsignado: string | undefined;

    if (estadoSeleccionado === 'en_proceso' || estadoSeleccionado === 'resuelto') {
      agenteAsignado = agentes[Math.floor(Math.random() * agentes.length)];
    }

    const nuevoReporte: Reporte = {
      id: Date.now(),
      tipo: 'Incidente Vial',
      descripcion: 'Evento generado automáticamente',
      latitud: 4.5339 + (Math.random() - 0.5) * 0.01,
      longitud: -75.6811 + (Math.random() - 0.5) * 0.01,
      fecha: new Date(),
      estado: estadoSeleccionado,
      agente: agenteAsignado
    };

    this.reportes.push(nuevoReporte);
    this.loadReportes();
  }

  actualizarSimulado(): void {
    this.generarReporteAutomatico();
  }
}
