import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArStateService } from '../../services/state/ar-state.service';
import { PoiService } from '../../services/data/poi-data.service';
import { ToastComponent } from '../toast/toast.component';
import { AR_TEXT } from '../../constants/ui-resources';

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

  constructor() {
    globalThis.addEventListener('locar-gps-update', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      this.fixesAceptados.update(n => n + 1);
      this.state.updateUserPosition({ lat: detail.lat, lng: detail.lng });
      this.state.updateGpsAccuracy(detail.accuracy);
    });
  }
}
