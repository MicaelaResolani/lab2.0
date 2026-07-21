import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- ================= PANTALLA DE LOGIN ================= -->
    <div class="login-overlay" *ngIf="!isLoggedIn">
      <div class="login-card">
        <h2>Medical Tech Pro - Hospital</h2>
        <p class="subtitle">Sistema de Gestión e Interoperabilidad (HL7/FHIR)</p>
        <p class="error-msg" *ngIf="errorMessage">{{ errorMessage }}</p>
        
        <form (submit)="login(); $event.preventDefault()">
          <input 
            type="text" 
            placeholder="Usuario (Ej: Dr. Gomez o Bioquimico)" 
            [(ngModel)]="usuario" 
            name="usuario" 
            required 
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            [(ngModel)]="password" 
            name="password" 
            required 
          />
          <button type="submit" class="btn-primary">Ingresar al Sistema</button>
        </form>
        <div style="margin-top: 1rem; font-size: 0.8rem; color: #64748b; text-align: left;">
          <p>💡 <strong>Tips de acceso:</strong></p>
          <p>• Médico: Usuario que empiece con "Dr." (Ej: Dr. Perez)</p>
          <p>• Laboratorio: Bioquimico / Lab</p>
        </div>
      </div>
    </div>

    <!-- ================= PANEL PRINCIPAL ================= -->
    <div class="app-shell" *ngIf="isLoggedIn">
      <header class="app-header">
        <h1>Medical Tech Pro - Panel Clínico Integrado</h1>
        <div style="display: flex; align-items: center; gap: 1rem;">
          <span class="user-badge">
            👤 {{ usuarioActivo.nombre }} | <strong>Rol: {{ usuarioActivo.rol }}</strong>
          </span>
          <button class="btn-logout" (click)="logout()">Cerrar Sesión</button>
        </div>
      </header>

      <main style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
        
        <!-- ================= VISTA MÉDICO (CPOE - Órdenes Electrónicas) ================= -->
        <div *ngIf="usuarioActivo.rol === 'Médico Solicitante'">
          <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 2rem;">
            <h2>Nueva Orden Médica de Laboratorio (CPOE)</h2>
            <p style="color: #64748b; font-size: 0.9rem;">Solicitud clínica estructurada con codificación estándar.</p>
            
            <form (submit)="crearOrdenMedica(); $event.preventDefault()" style="display: grid; gap: 1rem; margin-top: 1rem;">
              <div>
                <label style="display: block; font-weight: 500; font-size: 0.9rem; margin-bottom: 4px;">Paciente:</label>
                <input type="text" [(ngModel)]="nuevaOrden.paciente" name="paciente" placeholder="Nombre y Apellido" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;" />
              </div>

              <div>
                <label style="display: block; font-weight: 500; font-size: 0.9rem; margin-bottom: 4px;">Práctica (Estándar LOINC):</label>
                <select [(ngModel)]="nuevaOrden.practica" name="practica" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
                  <option value="" disabled selected>Seleccione análisis...</option>
                  <option *ngFor="let p of practicasDisponibles" [value]="p">{{ p }}</option>
                </select>
              </div>

              <div>
                <label style="display: block; font-weight: 500; font-size: 0.9rem; margin-bottom: 4px;">Diagnóstico Presuntivo (SNOMED-CT):</label>
                <input type="text" [(ngModel)]="nuevaOrden.diagnostico" name="diagnostico" placeholder="Ej: Control evolutivo" required style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;" />
              </div>

              <button type="submit" class="btn-primary" style="width: auto; padding: 10px 20px; background-color: #2563eb;">Emitir y Firmar Orden Electrónica</button>
            </form>
          </div>

          <h2>Historial de Órdenes y Resultados Clínicos</h2>
          <div *ngFor="let muestra of muestras" class="muestra-card">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
              <span><strong>ID:</strong> {{ muestra.id }}</span>
              <span style="font-size: 0.85rem; color: #64748b;">Emitida: {{ muestra.timestamp }}</span>
            </div>
            <p><strong>Paciente:</strong> {{ muestra.paciente }}</p>
            <p><strong>Práctica:</strong> {{ muestra.practica }}</p>
            <p><strong>Diagnóstico:</strong> {{ muestra.diagnostico }}</p>
            <p>
              <strong>Estado LIS:</strong> 
              <span [style.color]="muestra.estado === 'Validada' ? 'green' : (muestra.estado === 'Rechazada' ? 'red' : 'orange')">
                {{ muestra.estado }}
              </span>
              <span *ngIf="muestra.estado === 'Rechazada'"> (Motivo: {{ muestra.motivoRechazo }})</span>
            </p>

            <!-- Reporte Estructurado para el Médico (ORU) -->
            <div *ngIf="muestra.estado === 'Validada' && muestra.resultadoReporte" style="margin-top: 1rem; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <p style="margin: 0; font-weight: 600; color: #1e293b;">Informe Validado de Laboratorio (ORU)</p>
              </div>

              <!-- Hemograma punto por punto -->
              <div *ngIf="muestra.practica.includes('Hemograma')">
                <h4 style="margin: 6px 0; color: #2563eb; font-size: 0.9rem;">1. Serie Roja (Eritrograma)</h4>
                <p style="margin: 3px 0; font-size: 0.85rem;">• Eritrocitos: <strong>{{ muestra.resultadoReporte.eritrocitos }}</strong> mill/uL (Ref: 4.5 - 5.9)</p>
                <p style="margin: 3px 0; font-size: 0.85rem;">• Hemoglobina: <strong>{{ muestra.resultadoReporte.hemoglobina }}</strong> g/dL (Ref: 13.5 - 17.5)</p>
                <p style="margin: 3px 0; font-size: 0.85rem;">• Hematocrito: <strong>{{ muestra.resultadoReporte.hematocrito }}</strong> % (Ref: 41 - 53)</p>
                <p style="margin: 3px 0; font-size: 0.85rem;">• VCM: <strong>{{ muestra.resultadoReporte.vcm }}</strong> fL | HCM: <strong>{{ muestra.resultadoReporte.hcm }}</strong> pg</p>

                <h4 style="margin: 10px 0 6px 0; color: #2563eb; font-size: 0.9rem;">2. Serie Blanca (Leucograma)</h4>
                <p style="margin: 3px 0; font-size: 0.85rem;">• Leucocitos Totales: <strong>{{ muestra.resultadoReporte.leucocitos }}</strong> /uL (Ref: 4,000 - 11,000)</p>
                <p style="margin: 3px 0; font-size: 0.85rem;">• Neutrófilos Segmentados: <strong>{{ muestra.resultadoReporte.neutrofilos }}</strong> %</p>
                <p style="margin: 3px 0; font-size: 0.85rem;">• Linfocitos: <strong>{{ muestra.resultadoReporte.linfocitos }}</strong> %</p>

                <h4 style="margin: 10px 0 6px 0; color: #2563eb; font-size: 0.9rem;">3. Serie Plaquetaria</h4>
                <p style="margin: 3px 0; font-size: 0.85rem;">• Plaquetas: <strong>{{ muestra.resultadoReporte.plaquetas }}</strong> /uL (Ref: 150,000 - 450,000)</p>
              </div>

              <!-- Otras prácticas -->
              <div *ngIf="!muestra.practica.includes('Hemograma')">
                <p style="margin: 4px 0;">Valor Analítico: <strong>{{ muestra.resultadoReporte.valorSimple }}</strong></p>
              </div>
            </div>
          </div>
        </div>


        <!-- ================= VISTA LABORATORIO / LIS ================= -->
        <div *ngIf="usuarioActivo.rol === 'Laboratorio / Bioquímica'">
          <h2>Tablero de Recepción y Control Analítico (LIS)</h2>
          <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 1rem;">Gestión de tubos preanalíticos, validación técnica e interfaz con instrumentos.</p>
          
          <!-- Filtros de Estado -->
          <div style="display: flex; gap: 8px; margin-bottom: 1.5rem;">
            <button (click)="filtroEstado = 'Todos'" [style.background]="filtroEstado === 'Todos' ? '#1e293b' : '#e2e8f0'" [style.color]="filtroEstado === 'Todos' ? 'white' : '#334155'" style="border:none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Todos</button>
            <button (click)="filtroEstado = 'Pendiente'" [style.background]="filtroEstado === 'Pendiente' ? '#1e293b' : '#e2e8f0'" [style.color]="filtroEstado === 'Pendiente' ? 'white' : '#334155'" style="border:none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Pendientes</button>
            <button (click)="filtroEstado = 'Aceptada'" [style.background]="filtroEstado === 'Aceptada' ? '#1e293b' : '#e2e8f0'" [style.color]="filtroEstado === 'Aceptada' ? 'white' : '#334155'" style="border:none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">En Análisis / Aceptadas</button>
            <button (click)="filtroEstado = 'Validada'" [style.background]="filtroEstado === 'Validada' ? '#1e293b' : '#e2e8f0'" [style.color]="filtroEstado === 'Validada' ? 'white' : '#334155'" style="border:none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Validadas</button>
            <button (click)="filtroEstado = 'Rechazada'" [style.background]="filtroEstado === 'Rechazada' ? '#1e293b' : '#e2e8f0'" [style.color]="filtroEstado === 'Rechazada' ? 'white' : '#334155'" style="border:none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Rechazadas</button>
          </div>

          <div *ngFor="let muestra of muestrasFiltradas" class="muestra-card">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
              <span><strong>ID:</strong> {{ muestra.id }} | <strong>Médico:</strong> {{ muestra.medico }}</span>
              <span style="font-size: 0.85rem; color: #64748b;">{{ muestra.timestamp }}</span>
            </div>
            
            <p><strong>Paciente:</strong> {{ muestra.paciente }}</p>
            <p><strong>Práctica:</strong> {{ muestra.practica }}</p>
            <p>
              <strong>Estado LIS:</strong> 
              <span [style.color]="muestra.estado === 'Validada' ? 'green' : (muestra.estado === 'Rechazada' ? 'red' : 'orange')">
                {{ muestra.estado }}
              </span>
              <span *ngIf="muestra.estado === 'Rechazada'"> (Motivo: {{ muestra.motivoRechazo }})</span>
            </p>

            <!-- Bitácora de Notas -->
            <div *ngIf="muestra.notas && muestra.notas.length > 0" style="margin: 0.5rem 0; background: #f8fafc; padding: 8px; border-radius: 4px;">
              <small><strong>Bitácora:</strong></small>
              <ul style="margin: 0; padding-left: 20px; font-size: 0.9rem;">
                <li *ngFor="let nota of muestra.notas">{{ nota }}</li>
              </ul>
            </div>

            <!-- Input agregar nota -->
            <div style="margin-top: 0.5rem; display: flex; gap: 5px;" *ngIf="muestra.estado !== 'Validada' && muestra.estado !== 'Rechazada'">
              <input 
                type="text" 
                placeholder="Observación técnica..." 
                [(ngModel)]="notasMuestra[muestra.id]" 
                name="nota-{{muestra.id}}"
                style="padding: 6px; font-size: 0.9rem; flex: 1; border: 1px solid #cbd5e1; border-radius: 4px;"
              />
              <button type="button" (click)="agregarNota(muestra.id)" style="padding: 6px 12px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">Guardar</button>
            </div>

            <!-- Botones Aceptar / Rechazar si está Pendiente -->
            <div style="display: flex; gap: 10px; margin-top: 1rem; align-items: center;" *ngIf="muestra.estado === 'Pendiente'">
              <button class="btn-primary" style="background-color: #16a34a; width: auto; padding: 8px 16px;" (click)="aceptarMuestra(muestra)">Aceptar Tubo e Interfacear Resultados</button>
              
              <div style="display: flex; gap: 5px; flex: 1;">
                <select [(ngModel)]="motivoRechazoSeleccionado[muestra.id]" name="select-{{muestra.id}}" style="padding: 8px; border-radius: 4px; border: 1px solid #cbd5e1; flex: 1;">
                  <option value="" disabled selected>Motivo de rechazo...</option>
                  <option *ngFor="let motivo of motivosRechazo" [value]="motivo">{{ motivo }}</option>
                </select>
                <button 
                  class="btn-logout" 
                  style="background-color: #dc2626;" 
                  [disabled]="!motivoRechazoSeleccionado[muestra.id]"
                  [style.opacity]="!motivoRechazoSeleccionado[muestra.id] ? '0.5' : '1'"
                  (click)="rechazarMuestra(muestra)">
                  Rechazar
                </button>
              </div>
            </div>

            <!-- Panel de Edición y Validación Bioquímica (Campos Editables punto por punto) -->
            <div *ngIf="muestra.estado === 'Aceptada'" style="margin-top: 1rem; background: #f0fdf4; padding: 12px; border-radius: 6px; border: 1px solid #bbf7d0;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #166534;">✏️ Edición y Validación Bioquímica (Datos precargados del analizador):</p>
              
              <!-- Hemograma editable punto por punto -->
              <div *ngIf="muestra.practica.includes('Hemograma')" style="background: white; padding: 10px; border-radius: 4px; border: 1px solid #dcfce7; margin-bottom: 10px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.85rem;">
                  <div>
                    <label style="display:block; font-weight:500; margin-bottom:2px;">Eritrocitos (mill/uL):</label>
                    <input type="number" step="0.1" [(ngModel)]="muestra.resultadoReporte.eritrocitos" name="eri-{{muestra.id}}" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:4px;" />
                  </div>
                  <div>
                    <label style="display:block; font-weight:500; margin-bottom:2px;">Hemoglobina (g/dL):</label>
                    <input type="number" step="0.1" [(ngModel)]="muestra.resultadoReporte.hemoglobina" name="hgb-{{muestra.id}}" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:4px;" />
                  </div>
                  <div>
                    <label style="display:block; font-weight:500; margin-bottom:2px;">Hematocrito (%):</label>
                    <input type="number" [(ngModel)]="muestra.resultadoReporte.hematocrito" name="hct-{{muestra.id}}" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:4px;" />
                  </div>
                  <div>
                    <label style="display:block; font-weight:500; margin-bottom:2px;">VCM (fL):</label>
                    <input type="number" [(ngModel)]="muestra.resultadoReporte.vcm" name="vcm-{{muestra.id}}" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:4px;" />
                  </div>
                  <div>
                    <label style="display:block; font-weight:500; margin-bottom:2px;">HCM (pg):</label>
                    <input type="number" [(ngModel)]="muestra.resultadoReporte.hcm" name="hcm-{{muestra.id}}" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:4px;" />
                  </div>
                  <div>
                    <label style="display:block; font-weight:500; margin-bottom:2px;">Leucocitos (/uL):</label>
                    <input type="number" [(ngModel)]="muestra.resultadoReporte.leucocitos" name="leu-{{muestra.id}}" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:4px;" />
                  </div>
                  <div>
                    <label style="display:block; font-weight:500; margin-bottom:2px;">Neutrófilos (%):</label>
                    <input type="number" [(ngModel)]="muestra.resultadoReporte.neutrofilos" name="neu-{{muestra.id}}" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:4px;" />
                  </div>
                  <div>
                    <label style="display:block; font-weight:500; margin-bottom:2px;">Linfocitos (%):</label>
                    <input type="number" [(ngModel)]="muestra.resultadoReporte.linfocitos" name="lin-{{muestra.id}}" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:4px;" />
                  </div>
                  <div style="grid-column: span 2;">
                    <label style="display:block; font-weight:500; margin-bottom:2px;">Plaquetas (/uL):</label>
                    <input type="number" [(ngModel)]="muestra.resultadoReporte.plaquetas" name="plt-{{muestra.id}}" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:4px;" />
                  </div>
                </div>
              </div>

              <!-- Otras prácticas editables -->
              <div *ngIf="!muestra.practica.includes('Hemograma')" style="background: white; padding: 10px; border-radius: 4px; border: 1px solid #dcfce7; margin-bottom: 10px; font-size: 0.9rem;">
                <label style="display:block; font-weight:500; margin-bottom:2px;">Valor Analítico:</label>
                <input type="text" [(ngModel)]="muestra.resultadoReporte.valorSimple" name="val-{{muestra.id}}" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:4px;" />
              </div>

              <button (click)="validarCorridaAnalitica(muestra)" style="background: #16a34a; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 500;">Firmar y Liberar Informe al Médico</button>
            </div>

            <div *ngIf="muestra.estado === 'Validada'" style="margin-top: 1rem; background: #f0fdf4; padding: 10px; border-radius: 6px; border: 1px solid #bbf7d0;">
              <p style="margin: 0; font-size: 0.9rem; color: #166534;">✅ Informe validado técnicamente y liberado con éxito.</p>
            </div>

          </div>
        </div>

      </main>
    </div>
  `,
  styles: [`
    .login-overlay { display: flex; justify-content: center; align-items: center; height: 100vh; background: #f1f5f9; }
    .login-card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 350px; text-align: center; }
    .login-card input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box; }
    .subtitle { color: #64748b; font-size: 0.85rem; margin-bottom: 1.5rem; }
    .error-msg { color: #dc2626; font-size: 0.85rem; margin-bottom: 1rem; }
    .btn-primary { width: 100%; padding: 10px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; }
    .app-shell { min-height: 100vh; background: #f8fafc; }
    .app-header { background: #1e293b; color: white; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    .user-badge { background: #334155; padding: 6px 12px; border-radius: 4px; font-size: 0.9rem; }
    .btn-logout { background: #475569; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
    .muestra-card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 1rem; border-left: 4px solid #2563eb; }
  `]
})
export class AppComponent {
  isLoggedIn = false;
  usuario = '';
  password = '';
  errorMessage = '';

  usuarioActivo = {
    nombre: '',
    rol: ''
  };

  filtroEstado = 'Todos';
  motivoRechazoSeleccionado: { [key: string]: string } = {};
  notasMuestra: { [key: string]: string } = {};

  nuevaOrden = {
    paciente: '',
    practica: '',
    diagnostico: ''
  };

  practicasDisponibles = [
    'Hemograma Completo (LOINC: 5841-0)',
    'Glucemia en Ayunas (LOINC: 2345-7)',
    'Urea y Creatinina sérica (LOINC: 3094-0)',
    'Ionograma Plasmático (LOINC: 2951-2)',
    'Perfil Lipídico (LOINC: 24323-8)'
  ];

  muestras = [
    { 
      id: 'ORD-9021', 
      paciente: 'Juan Pérez', 
      medico: 'Dr. Roberto Sánchez', 
      practica: 'Hemograma Completo (LOINC: 5841-0)', 
      diagnostico: 'Control pre-quirúrgico', 
      estado: 'Pendiente', 
      motivoRechazo: '', 
      notas: [] as string[],
      timestamp: '21/07/2026 08:30',
      resultadoReporte: null as any
    },
    { 
      id: 'ORD-9022', 
      paciente: 'María Gómez', 
      medico: 'Dra. Claudia Benítez', 
      practica: 'Glucemia en Ayunas (LOINC: 2345-7)', 
      diagnostico: 'Control metabólico', 
      estado: 'Pendiente', 
      motivoRechazo: '', 
      notas: [] as string[],
      timestamp: '21/07/2026 09:15',
      resultadoReporte: null as any
    }
  ];

  motivosRechazo = [
    'Hemólisis masiva',
    'Muestra insuficiente / Volumen crítico',
    'Tubo incorrecto (Anticoagulante erróneo)',
    'Identificación errónea de muestra'
  ];

  get muestrasFiltradas() {
    if (this.filtroEstado === 'Todos') {
      return this.muestras;
    }
    return this.muestras.filter(m => m.estado === this.filtroEstado);
  }

  login() {
    if (this.usuario.trim() && this.password.trim()) {
      this.isLoggedIn = true;
      this.usuarioActivo.nombre = this.usuario;
      
      if (this.usuario.toLowerCase().includes('dr') || this.usuario.toLowerCase().includes('medico')) {
        this.usuarioActivo.rol = 'Médico Solicitante';
      } else {
        this.usuarioActivo.rol = 'Laboratorio / Bioquímica';
      }
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Por favor, ingrese usuario y contraseña.';
    }
  }

  logout() {
    this.isLoggedIn = false;
    this.usuario = '';
    this.password = '';
    this.usuarioActivo.nombre = '';
    this.usuarioActivo.rol = '';
  }

  crearOrdenMedica() {
    if (this.nuevaOrden.paciente && this.nuevaOrden.practica && this.nuevaOrden.diagnostico) {
      const nuevaId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
      const ahora = new Date();
      const horaStr = ahora.toLocaleDateString() + ' ' + ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      this.muestras.unshift({
        id: nuevaId,
        paciente: this.nuevaOrden.paciente,
        medico: this.usuarioActivo.nombre,
        practica: this.nuevaOrden.practica,
        diagnostico: this.nuevaOrden.diagnostico,
        estado: 'Pendiente',
        motivoRechazo: '',
        notas: [],
        timestamp: horaStr,
        resultadoReporte: null
      });

      this.nuevaOrden.paciente = '';
      this.nuevaOrden.practica = '';
      this.nuevaOrden.diagnostico = '';
      alert('¡Orden médica electrónica generada con éxito y transmitida al LIS!');
    }
  }

  aceptarMuestra(muestra: any) {
    muestra.estado = 'Aceptada';
    muestra.motivoRechazo = '';

    // Precarga automática de valores estándar del analizador (listos para editar)
    if (muestra.practica.includes('Hemograma')) {
      muestra.resultadoReporte = {
        eritrocitos: 4.8,
        hemoglobina: 14.2,
        hematocrito: 42,
        vcm: 88,
        hcm: 30,
        leucocitos: 7500,
        neutrofilos: 60,
        linfocitos: 30,
        plaquetas: 250000
      };
    } else {
      muestra.resultadoReporte = {
        valorSimple: '98 mg/dL'
      };
    }
  }

  rechazarMuestra(muestra: any) {
    const motivo = this.motivoRechazoSeleccionado[muestra.id];
    if (motivo) {
      muestra.motivoRechazo = motivo;
      muestra.estado = 'Rechazada';
    }
  }

  agregarNota(muestraId: string) {
    const texto = this.notasMuestra[muestraId];
    if (texto && texto.trim()) {
      const muestra = this.muestras.find(m => m.id === muestraId);
      if (muestra) {
        if (!muestra.notas) {
          muestra.notas = [];
        }
        muestra.notas.push(texto.trim());
        this.notasMuestra[muestraId] = '';
      }
    }
  }

  validarCorridaAnalitica(muestra: any) {
    muestra.estado = 'Validada';
  }
}