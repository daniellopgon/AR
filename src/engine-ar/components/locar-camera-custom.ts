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

interface IOpcionesOrientacion {
    readonly smoothingFactor: number;
    readonly orientationChangeThreshold: number;
    readonly enablePermissionDialog: boolean;
}

interface IInstanciaLocar {
    setElevation(elevacion: number): void;
    startGps(): void;
    on(evento: string, callback: (eventoGps: IEventoGps) => void): void;
    add(malla: unknown, lon: number, lat: number): void;
}

interface IControlesOrientacion {
    on(evento: string, callback: () => void): void;
    connect(): void;
    init(): void;
    update(): void;
    dispose(): void;
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
    controlesOrientacion: IControlesOrientacion | null;
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
        const motorTres = AFRAME.THREE;
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
            
            if (coordenadas === undefined || evento.distMoved > 1000000) {
                console.warn('[GPS-GUARD] Evento ignorado: Datos incompletos o distancia imposible.');
                return;
            }

            const latitudFiltrada = coordenadas.latitude;
            const longitudFiltrada = coordenadas.longitude;

            console.info(`[LocAR OUT] ACEPTADO Dist: ${evento.distMoved.toFixed(2)}m | Lat ${latitudFiltrada}, Lon ${longitudFiltrada}`);

            if (this.tienePosicionInicial === false) {
                const cajasCalibracion = [
                    { latDis: 0.0005, lonDis: 0, color: 0xff0000 },
                    { latDis: -0.0005, lonDis: 0, color: 0xffff00 },
                    { latDis: 0, lonDis: -0.0005, color: 0x00ffff },
                    { latDis: 0, lonDis: 0.0005, color: 0x00ff00 },
                ];

                const geometria = new motorTres.BoxGeometry(10, 10, 10);

                for (const caja of cajasCalibracion) {
                    const malla = new motorTres.Mesh(
                        geometria,
                        new motorTres.MeshBasicMaterial({ color: caja.color })
                    );
                    
                    if (this.instanciaLocar !== null) {
                        this.instanciaLocar.add(malla, longitudFiltrada + caja.lonDis, latitudFiltrada + caja.latDis);
                    }
                }

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

        const opcionesOrientacion: IOpcionesOrientacion = {
            smoothingFactor: AR_CONFIG.ORIENTATION.SMOOTHING_FACTOR,
            orientationChangeThreshold: AR_CONFIG.ORIENTATION.CHANGE_THRESHOLD,
            enablePermissionDialog: AR_CONFIG.ORIENTATION.ENABLE_PERMISSION_DIALOG
        };

        this.controlesOrientacion = new (LocAR as unknown as { DeviceOrientationControls: new (camara: unknown, opciones: IOpcionesOrientacion) => IControlesOrientacion }).DeviceOrientationControls(camara, opcionesOrientacion);

        this.controlesOrientacion.on('deviceorientationgranted', () => {
            if (this.controlesOrientacion !== null) {
                this.controlesOrientacion.connect();
            }
        });

        this.controlesOrientacion.init();
    },

    tick(this: IComponenteCamaraPersonalizada): void {
        if (this.controlesOrientacion !== null && this.controlesOrientacion !== undefined) {
            this.controlesOrientacion.update();
        }
    },

    remove(this: IComponenteCamaraPersonalizada): void {
        if (this.controlesOrientacion !== null && this.controlesOrientacion !== undefined) {
            this.controlesOrientacion.dispose();
        }
    },

    add(this: IComponenteCamaraPersonalizada, objeto: unknown, longitud: number, latitud: number): void {
        if (this.instanciaLocar !== null && this.instanciaLocar !== undefined) {
            this.instanciaLocar.add(objeto, longitud, latitud);
        }
    }
});
