import { Injectable, signal, OnDestroy } from '@angular/core';

/** Precisión GPS máxima aceptable en metros */
const PRECISION_MAXIMA_ACEPTABLE = 100;

/** Intervalo mínimo en ms entre actualizaciones procesadas */
const INTERVALO_MINIMO_MS = 1000;

/**
 * Servicio que gestiona el tracking GPS nativo del navegador.
 * Reemplaza la dependencia de LocAR para obtener coordenadas.
 */
@Injectable({ providedIn: 'root' })
export class GpsTrackingService implements OnDestroy {
    readonly #latitud = signal(0);
    readonly #longitud = signal(0);
    readonly #precision = signal(999);
    readonly #activo = signal(false);
    readonly #ultimaActualizacion = signal(0);

    readonly latitud = this.#latitud.asReadonly();
    readonly longitud = this.#longitud.asReadonly();
    readonly precision = this.#precision.asReadonly();
    readonly activo = this.#activo.asReadonly();

    #watchId: number | null = null;

    /**
     * Inicia el seguimiento GPS usando la API nativa del navegador.
     */
    iniciar(): void {
        if (this.#watchId !== null) {
            return;
        }

        this.#watchId = navigator.geolocation.watchPosition(
            (posicion) => this.#procesarPosicion(posicion),
            (error) => this.#manejarError(error),
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 15000
            }
        );

        console.info('[GPS] Tracking GPS iniciado.');
    }

    /**
     * Detiene el seguimiento GPS y libera recursos.
     */
    detener(): void {
        if (this.#watchId === null) {
            return;
        }

        navigator.geolocation.clearWatch(this.#watchId);
        this.#watchId = null;
        this.#activo.set(false);
        console.info('[GPS] Tracking GPS detenido.');
    }

    ngOnDestroy(): void {
        this.detener();
    }

    /**
     * Procesa una nueva posición GPS validando precisión e intervalo.
     */
    #procesarPosicion(posicion: GeolocationPosition): void {
        const coordenadas = posicion.coords;
        const ahora = Date.now();

        if (coordenadas.accuracy > PRECISION_MAXIMA_ACEPTABLE) {
            console.warn(`[GPS] Precisión insuficiente: ${coordenadas.accuracy.toFixed(0)}m`);
            this.#precision.set(coordenadas.accuracy);
            return;
        }

        const tiempoDesdeUltima = ahora - this.#ultimaActualizacion();
        if (tiempoDesdeUltima < INTERVALO_MINIMO_MS) {
            return;
        }

        this.#latitud.set(coordenadas.latitude);
        this.#longitud.set(coordenadas.longitude);
        this.#precision.set(coordenadas.accuracy);
        this.#activo.set(true);
        this.#ultimaActualizacion.set(ahora);

        console.info(
            `[GPS] Lat: ${coordenadas.latitude.toFixed(6)}, ` +
            `Lng: ${coordenadas.longitude.toFixed(6)}, ` +
            `Acc: ${coordenadas.accuracy.toFixed(0)}m`
        );
    }

    /**
     * Maneja errores del API de geolocalización.
     */
    #manejarError(error: GeolocationPositionError): void {
        const mensajes: Record<number, string> = {
            1: 'Permiso de ubicación denegado',
            2: 'Posición no disponible',
            3: 'Tiempo de espera agotado'
        };

        const mensaje = mensajes[error.code] ?? 'Error desconocido';
        console.error(`[GPS] ${mensaje} (código: ${error.code})`);
    }
}
