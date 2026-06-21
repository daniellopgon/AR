import { Injectable, signal } from '@angular/core';

// Servicio que se utiliza para obtener los valores de las variables privadas es una centralización y única
// Fuente de verdad para el estado de AR
@Injectable({ providedIn: 'root' })
export class ArStateService {
    // señales para variables relacionadas con la AR, se actualizan solas o desde otros servicios
    readonly #isStabilized = signal(false);
    readonly #gpsAccuracy = signal(0);
    readonly #userPosition = signal<{ lat: number; lng: number } | null>(null);
    readonly #heading = signal(0);

    //Variables privadas de solo lectura que se utilizan para obtener los valores de las variables privadas
    readonly isStabilized = this.#isStabilized.asReadonly();

    readonly gpsAccuracy = this.#gpsAccuracy.asReadonly();
    readonly userPosition = this.#userPosition.asReadonly();
    readonly heading = this.#heading.asReadonly();

    // Actualizar si la cámara está estabilizada
    setStabilized(value: boolean): void {
        this.#isStabilized.set(value);
    }

    // Actualizar el accuracy del gps
    updateGpsAccuracy(accuracy: number): void {
        this.#gpsAccuracy.set(accuracy);
    }

    // Actualizar la posición del usuario
    updateUserPosition(position: { lat: number; lng: number } | null): void {
        this.#userPosition.set(position);
    }

    // Actualizar la dirección (heading)
    updateHeading(heading: number): void {
        this.#heading.set(heading);
    }
}
