import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArStateService } from '../../services/state/ar-state.service';
import { GpsTrackingService } from '../../services/infraestructure/gps-tracking.service';
import { PoiService } from '../../services/data/poi-data.service';
import { ToastComponent } from '../toast/toast.component';
import { AR_TEXT } from '../../constants/ui-resources';

/**
 * Componente HUD que muestra información de estado:
 * precisión GPS, número de POIs visibles y estado de calibración.
 */
@Component({
    selector: 'app-ar-hud',
    imports: [CommonModule, ToastComponent],
    templateUrl: './ar-hud.component.html',
    styleUrl: './ar-hud.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArHudComponent {
    protected readonly state = inject(ArStateService);
    protected readonly gpsService = inject(GpsTrackingService);
    protected readonly poiService = inject(PoiService);
    protected readonly AR_TEXT = AR_TEXT;

    constructor() {
        this.#sincronizarGpsConEstado();
    }

    /**
     * Sincroniza las señales del GpsTrackingService con el ArStateService.
     */
    #sincronizarGpsConEstado(): void {
        effect(() => {
            const lat = this.gpsService.latitud();
            const lng = this.gpsService.longitud();
            const precision = this.gpsService.precision();
            const activo = this.gpsService.activo();

            this.state.updateGpsAccuracy(precision);

            if (activo) {
                this.state.updateUserPosition({ lat, lng });
                this.state.setStabilized(precision < 20);
            }
        });
    }
}
