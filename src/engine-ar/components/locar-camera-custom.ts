import * as LocAR from 'locar';
import { AR_CONFIG } from '../ar-config';

interface IGpsCoords {
    readonly latitude: number;
    readonly longitude: number;
    readonly accuracy: number;
}

interface IPosicionGps {
    readonly coords?: IGpsCoords;
}

interface IEventoGps {
    readonly position?: IPosicionGps;
    readonly distMoved: number;
}

interface IOpcionesGps {
    readonly gpsMinDistance: number;
    readonly gpsMinAccuracy: number;
}

interface IInstanciaLocar {
    setElevation(elevacion: number): void;
    startGps(): void;
    on(evento: string, callback: (eventoGps: IEventoGps) => void): void;
    add(malla: unknown, lon: number, lat: number): void;
}

interface IEntidadAFrame {
    sceneEl: { object3D: unknown };
    getObject3D(nombre: string): unknown;
    components: Record<string, Record<string, unknown>>;
    emit(nombreEvento: string, datos?: unknown): void;
}

interface IComponenteCamaraPersonalizada {
    el: IEntidadAFrame;
    instanciaLocar: IInstanciaLocar | null;
    tienePosicionInicial: boolean;
    init(): void;
    tick(): void;
    remove(): void;
    add(objeto: unknown, longitud: number, latitud: number): void;
}

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

            if (esPrimeraPosicion === false && evento.distMoved > 1000000) {
                console.warn(`[GPS-GUARD] Evento ignorado: Distancia imposible (${evento.distMoved}m).`);
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

    tick(this: IComponenteCamaraPersonalizada): void {
        // La cámara es completamente estática 
    },

    remove(this: IComponenteCamaraPersonalizada): void {
        // Nada que limpiar aquí
    },

    add(this: IComponenteCamaraPersonalizada, objeto: unknown, longitud: number, latitud: number): void {
        if (this.instanciaLocar !== null && this.instanciaLocar !== undefined) {
            this.instanciaLocar.add(objeto, longitud, latitud);
        }
    }
});
