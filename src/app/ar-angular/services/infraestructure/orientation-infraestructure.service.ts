import { Injectable, OnDestroy, inject } from '@angular/core';
import { PermissionsService } from './permissions-infraestructure.service';
import { Observable } from 'rxjs';
import { ArStateService } from '../state/ar-state.service';
import { GeoUtils } from '../../utils/geo-utils';

// Servicio que se encarga de manejar la orientación del dispositivo, en grados
@Injectable({
    providedIn: 'root'
})
// Implementa OnDestroy para limpiar los listeners cuando el servicio se destruye
export class OrientationService implements OnDestroy {
    // Inyección de dependencias
    private readonly permissionsService = inject(PermissionsService);
    private readonly arStateService = inject(ArStateService);

    // Variable pública que almacena el rumbo actual en grados
    private currentHeading = 0;
    // Buffer para suavizar los temblores del sensor magnético
    private buffer: number[] = [];
    // Tamaño del buffer
    private readonly BUFFER_SIZE = 5;
    // Función que se encarga de manejar la orientación del dispositivo
    private readonly boundHandleOrientation = (event: DeviceOrientationEvent) => this.handleOrientation(event);
    // Última actualización de la UI
    private lastUiUpdate = 0;

    constructor() {
        this.initOrientation();
    }
    // Método para solicitar permiso
    requestPermission(): Observable<boolean> {
        return this.permissionsService.requestOrientationPermission();
    }
    // Método para inicializar el servicio
    private initOrientation() {
        globalThis.addEventListener('deviceorientation', this.boundHandleOrientation, true);
    }
    // Método para manejar la orientación del dispositivo
    private handleOrientation(event: DeviceOrientationEvent) {
        let heading: number | null = null;

        if ((event as any).webkitCompassHeading) {
            heading = (event as any).webkitCompassHeading;
        } else if (event.alpha !== null) {
            heading = 360 - event.alpha;
        }

        if (heading !== null) {
            this.smoothHeading(heading);
            this.updateUiSignal();
        }
    }
    // Método privado que se encarga de promediar y suavizar la orientación
    private smoothHeading(newHeading: number) {
        this.buffer.push(newHeading);
        if (this.buffer.length > this.BUFFER_SIZE) {
            this.buffer.shift();
        }

        this.currentHeading = GeoUtils.calculateAverageHeading(this.buffer);
    }
    // Método privado que se encarga de actualizar el estado centralizado
    private updateUiSignal() {
        const now = Date.now();
        if (now - this.lastUiUpdate > 1000) {
            this.lastUiUpdate = now;
            this.arStateService.updateHeading(Math.round(this.currentHeading));
        }
    }

    // Método para limpiar los listeners cuando el servicio se destruye
    ngOnDestroy() {
        globalThis.removeEventListener('deviceorientation', this.boundHandleOrientation, true);
    }
}
