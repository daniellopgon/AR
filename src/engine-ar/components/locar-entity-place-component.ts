import { AR_CONFIG } from '../ar-config';
import {
    IInstanciaLocarExterna,
    IComponentesEntidad,
    IElementoLocar,
    IComponenteEntidadLocar
} from '../interfaces';

declare const AFRAME: {
    registerComponent: (nombre: string, definicion: unknown) => void;
};

/**
 * Componente que enlaza una entidad a coordenadas GPS estáticas usando LocAR.
 */
AFRAME.registerComponent('locar-entity-place', {
    schema: {
        latitude: { type: 'number', default: 0 },
        longitude: { type: 'number', default: 0 }
    },

    init(this: IComponenteEntidadLocar): void {
        this.posicionLista = false;
        this.instanciaLocar = null;
        this.alActualizarGps = this.aplicarCuandoLista.bind(this);

        const elementoLocar = this.el.sceneEl.querySelector(AR_CONFIG.SYSTEM.LOCAR_CAMERA_SELECTOR);

        if (elementoLocar === null || elementoLocar === undefined) {
            return;
        }

        const componenteCamara = elementoLocar.components['locar-camera-custom'];
        this.instanciaLocar = componenteCamara?.instanciaLocar ?? null;

        if (this.instanciaLocar !== null && componenteCamara?.tienePosicionInicial === true) {
            this.posicionLista = true;
            this.aplicarCoordenadasProyectadas();
            return;
        }

        const alTenerPosicionInicial = (): void => {
            elementoLocar.removeEventListener('gps-initial-position-determined', alTenerPosicionInicial);

            const camaraActualizada = elementoLocar.components['locar-camera-custom'];
            this.instanciaLocar = camaraActualizada?.instanciaLocar ?? null;

            if (this.instanciaLocar === null) {
                return;
            }

            this.instanciaLocar.on('gpsupdate', this.alActualizarGps);
        };

        elementoLocar.addEventListener('gps-initial-position-determined', alTenerPosicionInicial);
    },

    aplicarCuandoLista(this: IComponenteEntidadLocar): void {
        this.aplicarCoordenadasProyectadas();
        this.posicionLista = true;
    },

    update(this: IComponenteEntidadLocar): void {
        if (this.posicionLista === true) {
            this.aplicarCoordenadasProyectadas();
        }
    },

    remove(this: IComponenteEntidadLocar): void {
        if (this.instanciaLocar !== null) {
            this.instanciaLocar.off('gpsupdate', this.alActualizarGps);
        }
    },

    aplicarCoordenadasProyectadas(this: IComponenteEntidadLocar): void {
        if (this.instanciaLocar === null) {
            return;
        }

        const coordenadas = this.instanciaLocar.lonLatToWorldCoords(
            this.data.longitude,
            this.data.latitude
        );

        if (coordenadas === null || coordenadas === undefined) {
            return;
        }

        this.el.object3D.position.set(
            coordenadas[0],
            this.el.object3D.position.y,
            coordenadas[1]
        );
    }
});
