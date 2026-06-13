import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArStateService } from '../services/ar-state.service';
import { PoiService } from '../services/poi.service';
import { ToastComponent } from '../../../shared/ui/toast/toast.component';
import { AR_TEXT } from '../../../core/constants/ui-resources';

const CARDINAL_DIRECTIONS = [
  { name: 'NORTE', symbol: '↑', expected: 0, color: '#ff4444' },
  { name: 'ESTE', symbol: '→', expected: 90, color: '#44ff44' },
  { name: 'SUR', symbol: '↓', expected: 180, color: '#ffff44' },
  { name: 'OESTE', symbol: '←', expected: 270, color: '#44ffff' },
];

@Component({
  selector: 'app-ar-hud',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  template: `
    <div class="hud-container">
      <div class="overlay">
        <div class="badge" 
             [class.warning]="state.gpsAccuracy() > 10 && state.gpsAccuracy() <= 20"
             [class.stable]="state.gpsAccuracy() <= 10">
          {{ statusLabel() }}
        </div>
        <div class="stats">
          <span>{{ accuracyLabel() }}</span>
          <span>{{ cameraYLabel() }}</span>
          <span>{{ AR_TEXT.POI_COUNT }}{{ poiService.visiblePois().length }}</span>
          <span style="color:#00e5ff">FIXES OK: {{ fixesAceptados() }}</span>
        </div>

        <div class="compass-panel">
          <div class="compass-direction" [style.color]="compassInfo().color">
            {{ compassInfo().symbol }} {{ compassInfo().name }}
          </div>
          <div class="compass-row">
            <span>α {{ compassInfo().alpha }}°</span>
            <span class="compass-deviation" [class.ok]="compassInfo().deviationAbs < 5" [class.warn]="compassInfo().deviationAbs >= 5 && compassInfo().deviationAbs < 15" [class.bad]="compassInfo().deviationAbs >= 15">
              desv {{ compassInfo().deviation }}°
            </span>
          </div>
        </div>
      </div>
      
      <app-toast></app-toast>
    </div>
  `,
  styles: [`
    .hud-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
      padding: 16px;
      font-family: 'Segoe UI', Roboto, sans-serif;
    }
    .overlay {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .badge {
      align-self: flex-start;
      padding: 4px 12px;
      border-radius: 20px;
      background: rgba(0, 0, 0, 0.6);
      color: #f44336; 
      font-weight: bold;
      font-size: 0.8rem;
      backdrop-filter: blur(4px);
    }
    .badge.warning {
      color: #ffeb3b; 
    }
    .badge.stable {
      color: #4caf50; 
    }
    .stats {
      display: flex;
      flex-direction: column;
      color: white;
      font-size: 0.75rem;
      text-shadow: 1px 1px 2px black;
    }
    .compass-panel {
      background: rgba(0,0,0,0.65);
      border-radius: 10px;
      padding: 6px 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      align-self: flex-start;
      backdrop-filter: blur(4px);
    }
    .compass-direction {
      font-size: 1rem;
      font-weight: bold;
      text-shadow: 1px 1px 2px black;
    }
    .compass-row {
      display: flex;
      gap: 10px;
      font-size: 0.75rem;
      color: #ccc;
    }
    .compass-deviation.ok   { color: #4caf50; }
    .compass-deviation.warn { color: #ffeb3b; }
    .compass-deviation.bad  { color: #f44336; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArHudComponent {
  protected readonly state = inject(ArStateService);
  protected readonly poiService = inject(PoiService);
  protected readonly AR_TEXT = AR_TEXT;

  protected readonly fixesAceptados = signal(0);
  private readonly compassAlpha = signal(0);

  constructor() {
    globalThis.addEventListener('locar-gps-update', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      this.fixesAceptados.update(n => n + 1);
      this.state.updateUserPosition({ lat: detail.lat, lng: detail.lng });
      this.state.updateGpsAccuracy(detail.accuracy);
    });

    globalThis.addEventListener('deviceorientationabsolute', (e: any) => {
      this.compassAlpha.set(e.alpha ?? 0);
    });
  }

  protected readonly compassInfo = computed(() => {
    const alpha = this.compassAlpha();

    const closest = CARDINAL_DIRECTIONS.reduce((prev, curr) => {
      const prevDiff = Math.abs(((alpha - prev.expected + 540) % 360) - 180);
      const currDiff = Math.abs(((alpha - curr.expected + 540) % 360) - 180);
      return currDiff < prevDiff ? curr : prev;
    });

    const deviation = Math.round(((alpha - closest.expected + 540) % 360) - 180);

    return {
      ...closest,
      alpha: Math.round(alpha),
      deviation,
      deviationAbs: Math.abs(deviation)
    };
  });

  protected readonly statusLabel = computed(() => {
    const acc = this.state.gpsAccuracy();
    const isStable = this.state.isStabilized();

    if (acc > 20) return 'BUSCANDO SEÑAL...';
    if (acc > 10) return AR_TEXT.CALIBRATING;
    return isStable ? AR_TEXT.STABLE : 'CALIBRANDO...';
  });

  protected readonly accuracyLabel = computed(() =>
    `${AR_TEXT.GPS_ACC}${this.state.gpsAccuracy().toFixed(0)}${AR_TEXT.METERS_UNIT}`
  );

  protected readonly cameraYLabel = computed(() =>
    `${AR_TEXT.CAM_Y}${this.state.cameraHeight().toFixed(1)}${AR_TEXT.METERS_UNIT}`
  );
}
