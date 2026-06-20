export interface IGpsCoords {
    readonly latitude: number;
    readonly longitude: number;
    readonly accuracy: number;
}

export interface IPosicionGps {
    readonly coords?: IGpsCoords;
}

export interface IEventoGps {
    readonly position?: IPosicionGps;
    readonly distMoved: number;
}

export interface IOpcionesGps {
    readonly gpsMinDistance: number;
    readonly gpsMinAccuracy: number;
}

export interface IInstanciaLocar {
    setElevation(elevacion: number): void;
    startGps(): void;
    on(evento: string, callback: (eventoGps: IEventoGps) => void): void;
    add(malla: unknown, lon: number, lat: number): void;
}

export interface IEntidadAFrame {
    sceneEl: { object3D: unknown };
    getObject3D(nombre: string): unknown;
    components: Record<string, Record<string, unknown>>;
    emit(nombreEvento: string, datos?: unknown): void;
}

export interface IComponenteCamaraPersonalizada {
    el: IEntidadAFrame;
    instanciaLocar: IInstanciaLocar | null;
    tienePosicionInicial: boolean;
    init(): void;
    tick(): void;
    remove(): void;
}

export interface IInstanciaLocarExterna {
    getLastKnownLocation(): unknown;
    on(evento: string, callback: () => void): void;
    off(evento: string, callback: () => void): void;
    lonLatToWorldCoords(longitud: number, latitud: number): [number, number] | null;
}

export interface IComponentesEntidad {
    'locar-camera-custom'?: {
        instanciaLocar?: IInstanciaLocarExterna;
        tienePosicionInicial?: boolean;
    };
    [clave: string]: unknown;
}

export interface IElementoLocar extends Element {
    components: IComponentesEntidad;
}

export interface IComponenteEntidadLocar {
    el: {
        sceneEl: {
            querySelector(selector: string): IElementoLocar | null;
        };
        object3D: {
            position: {
                y: number;
                set(x: number, y: number, z: number): void;
            };
        };
    };
    data: {
        latitude: number;
        longitude: number;
    };
    posicionLista: boolean;
    instanciaLocar: IInstanciaLocarExterna | null;
    alActualizarGps: () => void;
    aplicarCoordenadasProyectadas(): void;
    aplicarCuandoLista(): void;
}

export interface IOccluderData {
    width: number;
    height: number;
    depth: number;
}

export interface IOccluderComponent {
    data: IOccluderData;
    el: {
        setObject3D: (name: string, obj: unknown) => void;
    };
    init(): void;
    crearMallaOcultadora(): void;
}

export interface IPlaceMarkerData {
    name: string;
    model: string;
}

export interface IPlaceMarkerComponent {
    data: IPlaceMarkerData;
    el: any;
    mallaMarcador: any;
    system: IPlaceMarkerSystem;
    init(): void;
    remove(): void;
}

export interface IPlaceMarkerSystem {
    marcadores: IPlaceMarkerComponent[];
    elementoCamara: Element | null;
    ultimaBusqueda: number;
    calcularDesvanecimientos: (tiempo: number, deltaTiempo: number) => void;
    
    init(): void;
    registrarMarcador(marcador: IPlaceMarkerComponent): void;
    desregistrarMarcador(marcador: IPlaceMarkerComponent): void;
    obtenerCamara(): Element | null;
    tick(tiempo: number, deltaTiempo: number): void;
    actualizarDistanciasYDesvanecimientos(tiempo: number, deltaTiempo?: number): void;
}

export interface IPuntoInteres {
    name: string;
    lat: number;
    lng?: number;
    lon?: number;
}

export interface IPoiManagerSystem {
    puntosDeInteres: IPuntoInteres[];
    grupoEntidades: Map<string, any>;
    el: Element;
    init(): void;
    inicializarEntidades(todosLosPuntos: IPuntoInteres[]): void;
    establecerMarcadores(puntosNuevos: IPuntoInteres[]): void;
    actualizarVisibilidad(): void;
}

export interface IStabilitySystem {
    esEstable: boolean;
    ultimaPrecision: number;
    elementoCamara: any;
    alActualizarGps: (evento: any) => void;
    el: IEntidadAFrame;
    
    init(): void;
    tick(): void;
    comprobarEstabilidad(): void;
}
