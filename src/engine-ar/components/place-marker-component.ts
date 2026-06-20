import { AR_CONFIG } from '../ar-config';
import { IPlaceMarkerSystem, IPlaceMarkerComponent } from '../interfaces';

declare const AFRAME: any;
declare const THREE: any;

const UMBRAL_ESCALA_MINIMA = 0.01;

/**
 * Calcula el factor de desvanecimiento basado en la distancia a la cámara.
 */
const calcularFactorDesvanecimiento = (distancia: number): number => THREE.MathUtils.clamp(
    THREE.MathUtils.mapLinear(distancia, AR_CONFIG.FADE.START, AR_CONFIG.FADE.END, 1, 0),
    0, 1
);

/**
 * Aplica visibilidad y escala a un marcador según su factor de desvanecimiento.
 */
const aplicarDesvanecimientoAMarcador = (marcador: IPlaceMarkerComponent, factorEscala: number): void => {
    const elemento = marcador.el;
    const objeto3D = elemento.object3D;

    if (factorEscala <= UMBRAL_ESCALA_MINIMA) {
        if (objeto3D.visible === true) {
            objeto3D.visible = false;
        }
        return;
    }

    if (objeto3D.visible === false && elemento.getAttribute('visible') !== false) {
        objeto3D.visible = true;
    }

    const escalaFinal = AR_CONFIG.FADE.BASE_SCALE * factorEscala;
    objeto3D.scale.set(escalaFinal, escalaFinal, escalaFinal);

    if (marcador.mallaMarcador?.material !== undefined) {
        marcador.mallaMarcador.material.opacity = factorEscala;
    }
};

/**
 * Orienta los marcadores visibles hacia la cámara (efecto billboard).
 */
const orientarMarcadoresHaciaCamara = (marcadores: IPlaceMarkerComponent[], posicionCamara: any): void => {
    for (const marcador of marcadores) {
        const objeto3D = marcador.el.object3D;
        if (objeto3D !== undefined && objeto3D !== null && objeto3D.visible === true) {
            objeto3D.lookAt(posicionCamara);
        }
    }
};

/**
 * Sistema encargado de gestionar los marcadores en la escena y calcular su visibilidad y escala
 * basándose en la distancia a la cámara.
 */
AFRAME.registerSystem('place-marker', {
    /**
     * Inicializa las variables y funciones optimizadas del sistema.
     */
    init(this: IPlaceMarkerSystem): void {
        this.marcadores = [];
        this.elementoCamara = null;
        this.ultimaBusqueda = 0;
        this.calcularDesvanecimientos = AFRAME.utils.throttleTick(
            this.actualizarDistanciasYDesvanecimientos.bind(this),
            150,
            this
        );
    },

    /**
     * Registra un nuevo marcador en el sistema.
     */
    registrarMarcador(this: IPlaceMarkerSystem, marcador: IPlaceMarkerComponent): void {
        this.marcadores.push(marcador);
        console.info('[POI] Marcador añadido al sistema.');
    },

    /**
     * Elimina un marcador del sistema.
     */
    desregistrarMarcador(this: IPlaceMarkerSystem, marcador: IPlaceMarkerComponent): void {
        const indice = this.marcadores.indexOf(marcador);
        if (indice > -1) {
            this.marcadores.splice(indice, 1);
        }
    },

    /**
     * Obtiene la referencia a la cámara principal, utilizando una caché para no saturar el DOM.
     */
    obtenerCamara(this: IPlaceMarkerSystem): Element | null {
        if (this.elementoCamara !== null) {
            return this.elementoCamara;
        }

        const tiempoActual = performance.now();
        if (tiempoActual - this.ultimaBusqueda > 500) {
            this.elementoCamara = document.querySelector(AR_CONFIG.SYSTEM.LOCAR_CAMERA_SELECTOR);
            if (this.elementoCamara !== null) {
                console.info('[POI] Cámara vinculada a la caché.');
            }
            this.ultimaBusqueda = tiempoActual;
        }
        return this.elementoCamara;
    },

    /**
     * Bucle principal de ejecución del sistema.
     */
    tick(this: IPlaceMarkerSystem, tiempo: number, deltaTiempo: number): void {
        const camara = this.obtenerCamara();
        if (camara === null) {
            return;
        }

        orientarMarcadoresHaciaCamara(this.marcadores, (camara as any).object3D.position);
        this.calcularDesvanecimientos(tiempo, deltaTiempo);
    },

    /**
     * Calcula la escala y visibilidad de cada marcador dependiendo de su distancia a la cámara.
     */
    actualizarDistanciasYDesvanecimientos(this: IPlaceMarkerSystem, tiempo: number): void {
        const camara = this.obtenerCamara();
        if (camara === null) {
            return;
        }

        if (tiempo % 5000 < 200) {
            console.info(`[POI] Sistema operativo. Procesando ${this.marcadores.length} marcadores.`);
        }

        const posicionCamara = (camara as any).object3D.position;

        for (const marcador of this.marcadores) {
            if (marcador.el.object3D === undefined || marcador.el.object3D === null) {
                continue;
            }
            const distancia = marcador.el.object3D.position.distanceTo(posicionCamara);
            const factorEscala = calcularFactorDesvanecimiento(distancia);
            aplicarDesvanecimientoAMarcador(marcador, factorEscala);
        }
    }
});

/**
 * Configura un elemento A-Frame con una geometría plana y material de imagen.
 */
const configurarPlanoConImagen = (componente: IPlaceMarkerComponent, elemento: any, urlModelo: string): void => {
    elemento.setAttribute('geometry', AR_CONFIG.MARKER.DEFAULT_GEOMETRY);
    elemento.setAttribute('material', {
        shader: 'flat',
        src: urlModelo,
        transparent: true,
        side: 'double'
    });
    componente.mallaMarcador = elemento.getObject3D('mesh');
};

/**
 * Componente que representa un marcador físico en el espacio 3D.
 */
AFRAME.registerComponent('place-marker', {
    schema: {
        name: { type: 'string', default: AR_CONFIG.MARKER.DEFAULT_NAME },
        model: { type: 'asset' }
    },

    /**
     * Inicializa el componente y carga una imagen plana (2D) como marcador.
     */
    init(this: IPlaceMarkerComponent): void {
        this.mallaMarcador = null;
        const elemento = this.el;
        const urlModelo = this.data.model;

        configurarPlanoConImagen(this, elemento, urlModelo);

        elemento.object3D.position.y = AR_CONFIG.MARKER.HEIGHT_OFFSET;
        this.system.registrarMarcador(this);
    },

    /**
     * Función llamada cuando el componente es destruido. Lo elimina del sistema.
     */
    remove(this: IPlaceMarkerComponent): void {
        this.system.desregistrarMarcador(this);
    }
});
