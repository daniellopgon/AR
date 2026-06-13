import { Injectable, NgZone, signal, OnDestroy, inject, computed } from '@angular/core';
import { PermissionsService } from '../system/permissions.service';

@Injectable({
    providedIn: 'root'
})
export class OrientationService implements OnDestroy {
    private readonly permissionsService = inject(PermissionsService);
    private readonly ngZone = inject(NgZone);

    public currentHeading = 0;

    private readonly _headingSignal = signal<number>(0);
    public readonly heading = computed(() => this._headingSignal());

    private buffer: number[] = [];
    private readonly BUFFER_SIZE = 5;
    private readonly boundHandleOrientation = (event: DeviceOrientationEvent) => this.handleOrientation(event);
    private throttleTimer: any;
    private lastUiUpdate = 0;

    constructor() {
        this.initOrientation();
    }

    async requestPermission(): Promise<boolean> {
        return this.permissionsService.requestOrientationPermission();
    }

    private initOrientation() {
        this.ngZone.runOutsideAngular(() => {
            globalThis.addEventListener('deviceorientation', this.boundHandleOrientation, true);
        });
    }

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

    private smoothHeading(newHeading: number) {
        this.buffer.push(newHeading);
        if (this.buffer.length > this.BUFFER_SIZE) {
            this.buffer.shift();
        }

        let sinSum = 0;
        let cosSum = 0;

        for (const h of this.buffer) {
            const rad = h * Math.PI / 180;
            sinSum += Math.sin(rad);
            cosSum += Math.cos(rad);
        }

        const avgRad = Math.atan2(sinSum / this.buffer.length, cosSum / this.buffer.length);
        let avgDeg = avgRad * 180 / Math.PI;

        if (avgDeg < 0) avgDeg += 360;

        this.currentHeading = avgDeg;
    }

    private updateUiSignal() {
        const now = Date.now();
        if (now - this.lastUiUpdate > 1000) {
            this.lastUiUpdate = now;
            this.ngZone.run(() => {
                this._headingSignal.set(Math.round(this.currentHeading));
            });
        }
    }

    ngOnDestroy() {
        globalThis.removeEventListener('deviceorientation', this.boundHandleOrientation, true);
    }
}
