import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ArStateService {
    readonly isStabilized = signal(false);
    readonly cameraHeight = signal(0);
    readonly gpsAccuracy = signal(0);
    readonly userPosition = signal<{ lat: number; lng: number } | null>(null);

    setStabilized(value: boolean): void {
        this.isStabilized.set(value);
    }

    updateCameraHeight(height: number): void {
        this.cameraHeight.set(height);
    }

    updateGpsAccuracy(accuracy: number): void {
        this.gpsAccuracy.set(accuracy);
    }

    updateUserPosition(position: { lat: number; lng: number } | null): void {
        this.userPosition.set(position);
    }
}
