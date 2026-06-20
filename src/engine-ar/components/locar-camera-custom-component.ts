import * as LocAR from 'locar';
import { AR_CONFIG } from '../ar-config';
import {
    IEventoGps,
    IOpcionesGps,
    IInstanciaLocar,
    IComponenteCamaraPersonalizada
} from '../interfaces';

declare const AFRAME: {
    registerComponent: (nombre: string, definicion: unknown) => void;
    THREE: {
        BoxGeometry: new (ancho: number, alto: number, profundidad: number) => unknown;
        MeshBasicMaterial: new (opciones: { color: number }) => unknown;
        Mesh: new (geometria: unknown, material: unknown) => unknown;
    };
};

/**
 * Componente que gestiona la cámara locar y el tracking GPS.
 */
AFRAME.registerComponent('locar-camera-custom', {
    init(this: IComponenteCamaraPersonalizada): void {
        const escena = this.el.sceneEl.object3D;
        const camara = this.el.getObject3D('camera');

        if (camara === undefined || camara === null) {
            return;
        }

        const opcionesGps: IOpcionesGps = {
            gpsMinDistance: 7,
            gpsMinAccuracy: 10
        };

        this.instanciaLocar = new (LocAR as unknown as { LocationBased: new (escena: unknown, camara: unknown, opciones: IOpcionesGps) => IInstanciaLocar }).LocationBased(escena, camara, opcionesGps);
        this.instanciaLocar.setElevation(AR_CONFIG.GPS.ELEVATION);

        if (this.el.components['locar-camera-custom'] !== undefined) {
            this.el.components['locar-camera-custom']['instanciaLocar'] = this.instanciaLocar;
        }

        this.instanciaLocar.startGps();

        this.tienePosicionInicial = false;

        this.instanciaLocar.on('gpsupdate', (evento: IEventoGps): void => {
            const coordenadas = evento.position?.coords;

            if (coordenadas !== undefined) {
                console.info(`TU UBICACIÓN ACTUAL ES: Lat ${coordenadas.latitude}, Lng ${coordenadas.longitude}`);
            }

            const esPrimeraPosicion = this.tienePosicionInicial === false;

            if (coordenadas === undefined) {
                console.warn('[GPS-GUARD] Evento ignorado: Coordenadas indefinidas.');
                return;
            }

            // Filtro para ignorar saltos bruscos del GPS
            if (esPrimeraPosicion === false && evento.distMoved > 100) {
                console.warn(`[GPS-GUARD] Evento ignorado: Distancia anormal o salto GPS (${evento.distMoved}m).`);
                return;
            }

            const latitudFiltrada = coordenadas.latitude;
            const longitudFiltrada = coordenadas.longitude;

            console.info(`[LocAR OUT] ACEPTADO Dist: ${evento.distMoved.toFixed(2)}m | Lat ${latitudFiltrada}, Lon ${longitudFiltrada}`);

            if (this.tienePosicionInicial === false) {
                this.el.emit('gps-initial-position-determined', evento);
                this.tienePosicionInicial = true;
            }

            queueMicrotask(() => {
                const coordsFinales = evento.position?.coords;
                if (coordsFinales === undefined) {
                    return;
                }

                globalThis.dispatchEvent(new CustomEvent(AR_CONFIG.EVENTS.GPS_UPDATE, {
                    detail: {
                        distMoved: evento.distMoved,
                        lat: coordsFinales.latitude,
                        lng: coordsFinales.longitude,
                        accuracy: coordsFinales.accuracy
                    }
                }));
            });
        });
    },
});
