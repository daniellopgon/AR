import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArStateService } from '../../services/ar-state.service';
import { PoiService } from '../../services/poi.service';
import { ToastComponent } from '../toast/toast.component';
import { AR_TEXT } from '../../constants/ui-resources';

const CARDINAL_DIRECTIONS = [
  { name: 'NORTE', symbol: '↑', expected: 0, color: '#ff4444' },
  { name: 'ESTE', symbol: '→', expected: 90, color: '#44ff44' },
  { name: 'SUR', symbol: '↓', expected: 180, color: '#ffff44' },
  { name: 'OESTE', symbol: '←', expected: 270, color: '#44ffff' },
];

@Component({
  selector: 'app-ar-hud',
  imports: [CommonModule, ToastComponent],
  templateUrl: './ar-hud.component.html',
  styleUrl: './ar-hud.component.css',
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
}
