"use strict";

import { AR_CONFIG } from '../ar-config';

/**
 * Sistema que administra la creación, actualización y visibilidad de los puntos de interés en la escena.
 */
AFRAME.registerSystem('poi-manager', {
    /**
     * Inicializa las propiedades del sistema.
     */
    init() {
        this.puntosDeInteres = [];
        this.grupoEntidades = new Map();
    },

    /**
     * Crea e inicializa las entidades 3D para todos los puntos de interés.
     * @param {Array} todosLosPuntos - Arreglo con los datos de todos los puntos de interés.
     */
    inicializarEntidades(todosLosPuntos) {
        const escena = this.el;

        for (const punto of todosLosPuntos) {
            console.info(`%c[MOVIL POI] ${punto.name}: ${punto.lat.toFixed(6)}, ${punto.lng.toFixed(6)}`, "color: cyan");
            const idEntidad = `poi-${punto.name}`;

            const entidad = document.createElement('a-entity');
            entidad.setAttribute('id', idEntidad);
            
            const longitudPunto = punto.lng !== undefined ? punto.lng : punto.lon;
            
            entidad.setAttribute(AR_CONFIG.COMPONENTS.LOCAR_PLACE, {
                latitude: punto.lat,
                longitude: longitudPunto
            });
            entidad.setAttribute(AR_CONFIG.COMPONENTS.MARKER, {
                name: punto.name,
                model: AR_CONFIG.POI.DEFAULT_MODEL
            });
            entidad.setAttribute('scale', AR_CONFIG.MARKER.SCALE.NEAR);
            entidad.setAttribute('visible', false);

            escena.appendChild(entidad);
            this.grupoEntidades.set(idEntidad, entidad);
        }
    },

    /**
     * Establece los puntos de interés que deben estar activos y actualiza su visibilidad.
     * @param {Array} puntosNuevos - Lista de puntos que deben ser gestionados.
     */
    establecerMarcadores(puntosNuevos) {
        console.group('[POI-MANAGER] Recibido setMarkers');
        this.puntosDeInteres = puntosNuevos;
        this.actualizarVisibilidad();
        console.groupEnd();
    },

    /**
     * Actualiza la visibilidad de las entidades 3D basándose en la lista actual de puntos de interés.
     */
    actualizarVisibilidad() {
        const escena = this.el;
        const todosLosMarcadores = escena.querySelectorAll('a-entity[place-marker]');

        for (const marcador of todosLosMarcadores) {
            const idMarcador = marcador.getAttribute('id');
            if (this.grupoEntidades.has(idMarcador) === false) {
                marcador.remove();
            }
        }

        for (const [id, entidad] of this.grupoEntidades) {
            if (entidad.object3D !== undefined && entidad.object3D !== null) {
                entidad.object3D.visible = false;
            }
        }

        for (const punto of this.puntosDeInteres) {
            const idEntidad = `poi-${punto.name}`;
            const entidad = this.grupoEntidades.get(idEntidad);

            if (entidad !== undefined && entidad !== null && entidad.object3D !== undefined && entidad.object3D !== null) {
                entidad.object3D.visible = true;
            }
        }
    }
});
