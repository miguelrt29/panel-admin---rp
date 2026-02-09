import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Agente } from '../models/agente.model';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AgentesService {

  private apiUrl = 'http://localhost:60523/agentes';

  // 🔧 ACTIVAR / DESACTIVAR MOCK
  private usarMock = true; // ← cuando haya BD, pones false

  // 🧪 DATOS MOCK (TEMPORALES)
  private agentesMock: Agente[] = [
 {
  id: 1,
  placa: 'AT-123',
  nombre: 'Juan Pérez',
  documento: '1098765432',
  telefono: '3001234567',
  estado: 'OCUPADO',
  promedioResenas: 4.5
}

  ];

  constructor(private http: HttpClient) {}

  // ===============================
  // OBTENER TODOS LOS AGENTES
  // ===============================
  obtenerAgentes(): Observable<Agente[]> {
    if (this.usarMock) {
      return of(this.agentesMock).pipe(delay(500));
    }

    return this.http.get<Agente[]>(this.apiUrl)
      .pipe(catchError(() => of([])));
  }

  // ===============================
  // OBTENER AGENTE POR PLACA
  // ===============================
  obtenerAgentePorPlaca(placa: string): Observable<Agente> {
    if (this.usarMock) {
      const agente = this.agentesMock.find(
        a => a.placa.toLowerCase() === placa.toLowerCase()
      );

      if (agente) {
        return of(agente).pipe(delay(600));
      }

      return throwError(() => new Error('No encontrado')).pipe(delay(600));
    }

    return this.http.get<Agente>(`${this.apiUrl}/${placa}`);
  }

  // ===============================
  // ACTUALIZAR ESTADO
  // ===============================
  actualizarEstado(
    placa: string,
    estado: 'DISPONIBLE' | 'OCUPADO' | 'AUSENTE'
  ): Observable<any> {

    if (this.usarMock) {
      const agente = this.agentesMock.find(a => a.placa === placa);

      if (agente) {
        agente.estado = estado;
        return of({ ok: true }).pipe(delay(400));
      }

      return throwError(() => new Error('Error al actualizar'));
    }

    return this.http.patch(`${this.apiUrl}/${placa}`, { estado });
  }
}
