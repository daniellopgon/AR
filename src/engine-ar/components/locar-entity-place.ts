declare const AFRAME: any;
import { AR_CONFIG } from '../ar-config';

AFRAME.registerComponent('locar-entity-place', {
    schema: {
        latitude: { type: 'number', default: 0 },
        longitude: { type: 'number', default: 0 }
    },

    init(this: any) {
        this.positionReady = false;
        this.locarInstance = null;
        this.onGpsUpdate = this.applyWhenReady.bind(this);

        const locarEl = this.el.sceneEl.querySelector(AR_CONFIG.SYSTEM.LOCAR_CAMERA_SELECTOR);
        if (!locarEl) return;

        this.locarInstance = locarEl.components['locar-camera-custom']?.locar ?? null;

        if (this.locarInstance?.getLastKnownLocation()) {
            this.positionReady = true;
            this.applyProjectedCoordinates();
            return;
        }

        const onInitialPosition = () => {
            locarEl.removeEventListener('gps-initial-position-determined', onInitialPosition);
            this.locarInstance = locarEl.components['locar-camera-custom']?.locar ?? null;
            if (!this.locarInstance) return;
            this.locarInstance.on('gpsupdate', this.onGpsUpdate);
        };

        locarEl.addEventListener('gps-initial-position-determined', onInitialPosition);
    },

    applyWhenReady(this: any) {
        this.applyProjectedCoordinates();
        this.positionReady = true;
        this.locarInstance?.off('gpsupdate', this.onGpsUpdate);
    },

    update(this: any) {
        if (this.positionReady) {
            this.applyProjectedCoordinates();
        }
    },

    remove(this: any) {
        this.locarInstance?.off('gpsupdate', this.onGpsUpdate);
    },

    applyProjectedCoordinates(this: any) {
        if (!this.locarInstance) return;

        const coords = this.locarInstance.lonLatToWorldCoords(
            this.data.longitude,
            this.data.latitude
        );

        if (!coords) return;

        this.el.object3D.position.set(
            coords[0],
            this.el.object3D.position.y,
            coords[1]
        );
    }
});
