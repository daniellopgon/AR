import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PermissionsService {

    async requestOrientationPermission(): Promise<boolean> {
        const requestPermission = (DeviceOrientationEvent as any).requestPermission;
        if (!requestPermission) return true;

        const status = await requestPermission();
        if (status !== 'granted') throw new Error('NotAllowedError');

        return true;
    }

    async requestCameraPermission(): Promise<boolean> {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });

        stream.getTracks().forEach(track => track.stop());
        return true;
    }

}
