import { Injectable } from '@angular/core';
import { Tarea } from '../models/tarea.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TareasService {

  // 🔵 BASE DE DATOS TEMPORAL EN MEMORIA
  private tareas: Tarea[] = [];

  constructor() {}

  // =========================
  // ASIGNAR TAREA (SIMULADO)
  // =========================
  asignarTarea(tarea: Tarea): Observable<Tarea> {

    const nuevaTarea: Tarea = {
      ...tarea,
      id: Date.now() // ID simulado único
    };

    this.tareas.push(nuevaTarea);

    return of(nuevaTarea);
  }

  // =========================
  // OBTENER TAREAS POR AGENTE
  // =========================
  obtenerTareasPorAgente(placa: string): Observable<Tarea[]> {
    return of(
      this.tareas.filter(t => t.placaAgente === placa)
    );
  }

  // =========================
  // ELIMINAR TAREA (SIMULADO)
  // =========================
  eliminarTarea(id: number): Observable<boolean> {

    this.tareas = this.tareas.filter(t => t.id !== id);

    return of(true);
  }
}
