import { Component, ChangeDetectionStrategy, inject, viewChild, afterNextRender } from '@angular/core';
import { ArGraphicsComponent } from '../ar-graphics/ar-graphics.component';
import { ArHudComponent } from '../ar-hud/ar-hud.component';
import { ArMarkersOverlayComponent } from '../ar-markers-overlay/ar-markers-overlay.component';
import { PermissionsService } from '../../services/infraestructure/permissions-infraestructure.service';
import { GpsTrackingService } from '../../services/infraestructure/gps-tracking.service';
import { from, EMPTY, throwError } from 'rxjs';
import { concatMap, catchError } from 'rxjs/operators';

/**
 * Componente contenedor principal de la experiencia AR.
 * Orquesta la cámara, el GPS y los overlays de marcadores.
 */
@Component({
    selector: 'app-ar-screen',
    imports: [ArGraphicsComponent, ArHudComponent, ArMarkersOverlayComponent],
    templateUrl: './ar-screen.component.html',
    styleUrl: './ar-screen.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArScreenComponent {
    private readonly permissionsService = inject(PermissionsService);
    private readonly gpsService = inject(GpsTrackingService);

    readonly graphics = viewChild<ArGraphicsComponent>('graphics');

    constructor() {
        afterNextRender(() => {
            this.iniciarCamara();
            this.gpsService.iniciar();
        });
    }

    /**
     * Solicita permisos de cámara y asigna el stream al componente de vídeo.
     */
    private iniciarCamara(): void {
        this.permissionsService.requestCameraPermission().pipe(
            concatMap(tienePermiso => {
                if (!tienePermiso) {
                    return throwError(() => new Error('Permiso de cámara denegado'));
                }

                return from(navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                }));
            }),
            catchError(errorCapturado => {
                console.error('[AR] Error al iniciar la cámara:', errorCapturado);
                return EMPTY;
            })
        ).subscribe(streamCamara => {
            const componenteGraficos = this.graphics();
            if (componenteGraficos) {
                componenteGraficos.setVideoStream(streamCamara);
            }
        });
    }
}