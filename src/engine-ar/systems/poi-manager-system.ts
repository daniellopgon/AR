import { AR_CONFIG } from '../ar-config';
import { IPoiManagerSystem, IPuntoInteres } from '../interfaces';

declare const AFRAME: any;

/**
 * Sistema que administra la creación, actualización y visibilidad de los puntos de interés en la escena.
 */
AFRAME.registerSystem('poi-manager', {
    /**
     * Inicializa las propiedades del sistema.
     */
    init(this: IPoiManagerSystem): void {
        this.puntosDeInteres = [];
        this.grupoEntidades = new Map<string, Element>();
    },

    /**
     * Crea los paneles de imagen 2D para todos los puntos de interés, dejándolos invisibles por defecto.
     */
    inicializarEntidades(this: IPoiManagerSystem, todosLosPuntos: IPuntoInteres[]): void {
        const escena = this.el;

        for (const punto of todosLosPuntos) {
            const lngSeguro = punto.lng !== undefined ? punto.lng : (punto.lon ?? 0);
            console.info(`%c[MOVIL POI] ${punto.name}: ${punto.lat.toFixed(6)}, ${lngSeguro.toFixed(6)}`, "color: cyan");
            const idEntidad = `poi-${punto.name}`;

            const entidad = document.createElement('a-entity');
            entidad.setAttribute('id', idEntidad);

            entidad.setAttribute(AR_CONFIG.COMPONENTS.LOCAR_PLACE, {
                latitude: punto.lat,
                longitude: lngSeguro
            });
            entidad.setAttribute(AR_CONFIG.COMPONENTS.MARKER, {
                name: punto.name,
                model: AR_CONFIG.POI.DEFAULT_MODEL
            });
            entidad.setAttribute('scale', AR_CONFIG.MARKER.SCALE.NEAR);
            entidad.setAttribute('visible', 'false');

            escena.appendChild(entidad);
            this.grupoEntidades.set(idEntidad, entidad);
        }
    },

    /**
     * Establece los puntos de interés que deben estar activos y actualiza su visibilidad.
     */
    establecerMarcadores(this: IPoiManagerSystem, puntosNuevos: IPuntoInteres[]): void {
        console.group('[POI-MANAGER] Recibido setMarkers');
        this.puntosDeInteres = puntosNuevos;
        this.actualizarVisibilidad();
        console.groupEnd();
    },

    /**
     * Actualiza la visibilidad de las entidades 3D basándose en la lista actual de puntos de interés.
     */
    actualizarVisibilidad(this: IPoiManagerSystem): void {
        const escena = this.el;
        const todosLosMarcadores = escena.querySelectorAll('a-entity[place-marker]');

        for (let i = 0; i < todosLosMarcadores.length; i++) {
            const marcador = todosLosMarcadores[i];
            const idMarcador = marcador.getAttribute('id');
            if (idMarcador && this.grupoEntidades.has(idMarcador) === false) {
                marcador.remove();
            }
        }

        for (const [, entidad] of this.grupoEntidades) {
            const obj3D = (entidad as any).object3D;
            if (obj3D !== undefined && obj3D !== null) {
                obj3D.visible = false;
                entidad.setAttribute('visible', 'false');
            }
        }

        for (const punto of this.puntosDeInteres) {
            const idEntidad = `poi-${punto.name}`;
            const entidad = this.grupoEntidades.get(idEntidad);

            if (entidad !== undefined && entidad !== null) {
                const obj3D = (entidad as any).object3D;
                if (obj3D !== undefined && obj3D !== null) {
                    obj3D.visible = true;
                    entidad.setAttribute('visible', 'true');
                }
            }
        }
    }
});
