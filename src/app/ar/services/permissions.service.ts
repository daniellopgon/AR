import { Injectable } from '@angular/core';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class PermissionsService {

    requestOrientationPermission(): Observable<boolean> {
        const solicitarPermiso = (DeviceOrientationEvent as any).requestPermission;
        if (!solicitarPermiso) return of(true);

        const promesaPermiso = solicitarPermiso() as Promise<string>;
        
        return from(promesaPermiso).pipe(
            map(estadoPermiso => {
                if (estadoPermiso !== 'granted') throw new Error('NotAllowedError');
                return true;
            }),
            catchError(errorCapturado => throwError(() => errorCapturado))
        );
    }

    requestCameraPermission(): Observable<boolean> {
        const opcionesVideo = { video: { facingMode: 'environment' } };
        const peticionMedia = navigator.mediaDevices.getUserMedia(opcionesVideo);

        return from(peticionMedia).pipe(
            map(streamCamara => {
                const pistas = streamCamara.getTracks();
                pistas.forEach(pista => pista.stop());
                return true;
            }),
            catchError(errorCapturado => throwError(() => errorCapturado))
        );
    }
}
