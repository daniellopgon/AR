import { Injectable } from '@angular/core';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Servicio encargado de solicitar y gestionar los permisos de hardware
 * como la cámara y los sensores de orientación del dispositivo.
 */
@Injectable({
    providedIn: 'root'
})
export class PermissionsService {

    /**
     * Solicita al usuario acceso a los sensores de orientación.
     */
    requestOrientationPermission(): Observable<boolean> {
        // Extraemos la función de permisos específica para dispositivos Apple
        const solicitarPermiso = (DeviceOrientationEvent as any).requestPermission;

        if (!solicitarPermiso) return of(true);

        return from(solicitarPermiso()).pipe(
            map(estadoPermiso => {
                if (estadoPermiso !== 'granted') throw new Error('NotAllowedError');
                return true;
            }),
            catchError(errorCapturado => throwError(() => errorCapturado))
        );
    }

    /**
     * Solicita al usuario acceso a la cámara trasera del dispositivo.
     * El objetivo de esta función es únicamente validar el permiso, por lo que
     * la transmisión de video se detiene inmediatamente tras ser autorizada.
     * 
     */
    requestCameraPermission(): Observable<boolean> {
        const opcionesVideo = { video: { facingMode: 'environment' } };

        return from(navigator.mediaDevices.getUserMedia(opcionesVideo)).pipe(
            map(streamCamara => {
                const pistas = streamCamara.getTracks();
                pistas.forEach(pista => pista.stop());
                return true;
            }),
            catchError(errorCapturado => throwError(() => errorCapturado))
        );
    }
}
