import { AR_CONFIG } from '../ar-config';

AFRAME.registerSystem('stability', {
    init: function () {
        this.isStable = false;
        this.lastAccuracy = 999;
        this.cameraEl = document.querySelector(AR_CONFIG.SYSTEM.LOOK_AT_TARGET);

        this.onGpsUpdate = (e) => { this.lastAccuracy = e.detail.position.coords.accuracy; };
        globalThis.addEventListener(AR_CONFIG.EVENTS.GPS_UPDATE, this.onGpsUpdate);
    },

    tick: function () {
        if (this.isStable || !this.cameraEl) return;

        this.checkStability();
    },

    checkStability: function () {
        const y = this.cameraEl.object3D.position.y;

        if (y > AR_CONFIG.STABILITY.Y_MIN && this.lastAccuracy < AR_CONFIG.STABILITY.ACCURACY_MAX) {
            this.isStable = true;
            globalThis.removeEventListener(AR_CONFIG.EVENTS.GPS_UPDATE, this.onGpsUpdate);
            this.el.emit('ar-stable');
        }
    }
});
