import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AgentesService } from '../../../service/agentes.service';
import { ReportesService } from '../../../service/reportes.service';
import { TareasService } from '../../../service/tareas.service';

import { Agente } from '../../../models/agente.model';
import { Reporte } from '../../../models/reporte.model';
import { Tarea } from '../../../models/tarea.model';
import { SidebarAdmin } from '../sidebar-admin/sidebar-admin';

@Component({
  selector: 'app-gestion-agentes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarAdmin],
  templateUrl: './gestion-agentes.html',
  styleUrl: './gestion-agentes.css',
})
export class GestionAgentes {

  // =========================
  // BUSQUEDA
  // =========================
  placaBuscada: string = '';
  agente: Agente | null = null;

  // =========================
  // REPORTES
  // =========================
  reportes: Reporte[] = [];
  cargandoReportes = false;

  // =========================
  // TAREAS
  // =========================
  tareas: Tarea[] = [];
  cargandoTareas = false;

  // FORMULARIO TAREA
  descripcionTarea = '';
  fechaTarea = '';
  horaTarea = '';
  prioridadTarea: 'BAJA' | 'MEDIA' | 'ALTA' = 'MEDIA';
  mensajeTarea = '';

  // ESTADOS GENERALES
  cargando = false;
  error = '';

  constructor(
    private agentesService: AgentesService,
    private reportesService: ReportesService,
    private tareasService: TareasService
  ) {}

  // =========================
  // BUSCAR AGENTE
  // =========================
  buscarAgente(): void {
    if (!this.placaBuscada.trim()) {
      this.error = 'Ingrese un número de placa';
      return;
    }

    this.cargando = true;
    this.error = '';
    this.agente = null;
    this.reportes = [];
    this.tareas = [];

    this.agentesService.obtenerAgentePorPlaca(this.placaBuscada)
      .subscribe({
        next: (data) => {
          this.agente = data;
          this.cargando = false;
          this.cargarReportes();
          this.cargarTareas();
        },
        error: () => {
          this.error = 'No se encontró ningún agente con esa placa';
          this.cargando = false;
        }
      });
  }

  // =========================
  // CARGAR REPORTES
  // =========================
  cargarReportes(): void {
    if (!this.agente) return;

    this.cargandoReportes = true;

    this.reportesService.obtenerReportesPorAgente(this.agente.placa)
      .subscribe({
        next: (data) => {
          this.reportes = data;
          this.cargandoReportes = false;
        },
        error: () => {
          this.reportes = [];
          this.cargandoReportes = false;
        }
      });
  }

  // =========================
  // CARGAR TAREAS
  // =========================
  cargarTareas(): void {
    if (!this.agente) return;

    this.cargandoTareas = true;

    this.tareasService.obtenerTareasPorAgente(this.agente.placa)
      .subscribe({
        next: (data) => {
          this.tareas = data;
          this.cargandoTareas = false;
        },
        error: () => {
          this.tareas = [];
          this.cargandoTareas = false;
        }
      });
  }

  // =========================
  // ASIGNAR TAREA
  // =========================
  asignarTarea(): void {
    if (!this.agente) return;

    if (!this.descripcionTarea || !this.fechaTarea || !this.horaTarea) {
      this.mensajeTarea = 'Complete todos los campos';
      return;
    }

    const nuevaTarea: Tarea = {
      descripcion: this.descripcionTarea,
      fecha: this.fechaTarea,
      hora: this.horaTarea,
      prioridad: this.prioridadTarea,
      placaAgente: this.agente.placa
    };

    this.tareasService.asignarTarea(nuevaTarea).subscribe(() => {
      this.descripcionTarea = '';
      this.fechaTarea = '';
      this.horaTarea = '';
      this.prioridadTarea = 'MEDIA';
      this.cargarTareas();
    });
  }

  // =========================
  // ELIMINAR TAREA
  // =========================
eliminarTarea(tarea: Tarea): void {

  if (!confirm('¿Desea eliminar esta tarea?')) return;

  this.tareasService.eliminarTarea(tarea.id!)
    .subscribe(() => {
      this.cargarTareas();
    });
}
}