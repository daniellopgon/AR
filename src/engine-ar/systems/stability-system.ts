import { AR_CONFIG } from '../ar-config';
import { IStabilitySystem } from '../interfaces';

declare const AFRAME: any;

/**
 * Sistema que evalúa la estabilidad inicial de la cámara AR basándose en su altura y precisión GPS.
 */
AFRAME.registerSystem('stability', {
    /**
     * Inicializa el estado y los eventos del sistema de estabilidad.
     */
    init(this: IStabilitySystem): void {
        this.esEstable = false;
        this.ultimaPrecision = 999;
        this.elementoCamara = document.querySelector(AR_CONFIG.SYSTEM.LOOK_AT_TARGET);

        this.alActualizarGps = (evento: any) => { 
            this.ultimaPrecision = evento.detail.accuracy; 
        };
        
        globalThis.addEventListener(AR_CONFIG.EVENTS.GPS_UPDATE, this.alActualizarGps);
    },

    /**
     * Bucle de ejecución constante que verifica la estabilidad hasta que se consigue.
     */
    tick(this: IStabilitySystem): void {
        if (this.esEstable === true || this.elementoCamara === null) {
            return;
        }

        this.comprobarEstabilidad();
    },

    /**
     * Comprueba si la altura de la cámara y la precisión del GPS cumplen los requisitos mínimos.
     */
    comprobarEstabilidad(this: IStabilitySystem): void {
        if (this.elementoCamara === null || this.elementoCamara.object3D === undefined) {
            return;
        }

        const alturaCamara = this.elementoCamara.object3D.position.y;

        if (alturaCamara > AR_CONFIG.STABILITY.Y_MIN && this.ultimaPrecision < AR_CONFIG.STABILITY.ACCURACY_MAX) {
            this.esEstable = true;
            globalThis.removeEventListener(AR_CONFIG.EVENTS.GPS_UPDATE, this.alActualizarGps);
            this.el.emit('ar-stable');
        }
    }
});
