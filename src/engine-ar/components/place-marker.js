"use strict";

import { AR_CONFIG } from '../ar-config';

/**
 * Sistema encargado de gestionar los marcadores en la escena y calcular su visibilidad y escala 
 * basándose en la distancia a la cámara.
 */
AFRAME.registerSystem('place-marker', {
    /**
     * Inicializa las variables y funciones optimizadas del sistema.
     */
    init() {
        this.marcadores = [];
        this.elementoCamara = null;
        this.ultimaBusqueda = 0;
        this.calcularDesvanecimientos = AFRAME.utils.throttleTick(this.actualizarDistanciasYDesvanecimientos, 150, this);
    },

    /**
     * Registra un nuevo marcador en el sistema.
     */
    registrarMarcador(marcador) {
        this.marcadores.push(marcador);
        console.info('[POI] Marcador añadido al sistema.');
    },

    /**
     * Elimina un marcador del sistema.
      */
    desregistrarMarcador(marcador) {
        const indice = this.marcadores.indexOf(marcador);
        if (indice > -1) {
            this.marcadores.splice(indice, 1);
        }
    },

    /**
     * Obtiene la referencia a la cámara principal, utilizando una caché para no saturar el DOM.
     */
    obtenerCamara() {
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
    tick(tiempo, deltaTiempo) {
        const camara = this.obtenerCamara();
        if (camara === null) {
            return;
        }

        const posicionCamara = camara.object3D.position;

        for (const marcador of this.marcadores) {
            const objeto3D = marcador.el.object3D;
            if (objeto3D !== undefined && objeto3D !== null && objeto3D.visible === true) {
                objeto3D.lookAt(posicionCamara);
            }
        }

        this.calcularDesvanecimientos(tiempo, deltaTiempo);
    },

    /**
     * Calcula la escala y visibilidad de cada marcador dependiendo de su distancia a la cámara.
     */
    actualizarDistanciasYDesvanecimientos(tiempo, deltaTiempo) {
        const camara = this.obtenerCamara();
        if (camara === null) {
            return;
        }

        if (tiempo % 5000 < 200) {
            console.info(`[POI] Sistema operativo. Procesando ${this.marcadores.length} marcadores.`);
        }

        const posicionCamara = camara.object3D.position;
        const inicioDesvanecimiento = AR_CONFIG.FADE.START;
        const finDesvanecimiento = AR_CONFIG.FADE.END;
        const escalaBase = AR_CONFIG.FADE.BASE_SCALE;

        for (const marcador of this.marcadores) {
            const elemento = marcador.el;
            const objeto3D = elemento.object3D;

            if (objeto3D === undefined || objeto3D === null) {
                continue;
            }

            const distancia = objeto3D.position.distanceTo(posicionCamara);

            const escala = THREE.MathUtils.clamp(
                THREE.MathUtils.mapLinear(distancia, inicioDesvanecimiento, finDesvanecimiento, 1, 0),
                0, 1
            );

            if (escala <= 0.01) {
                if (objeto3D.visible === true) {
                    objeto3D.visible = false;
                }
                continue;
            }

            if (objeto3D.visible === false && elemento.getAttribute('visible') !== false) {
                objeto3D.visible = true;
            }

            const escalaFinal = escalaBase * escala;
            objeto3D.scale.set(escalaFinal, escalaFinal, escalaFinal);

            if (marcador.mallaMarcador !== undefined && marcador.mallaMarcador !== null && marcador.mallaMarcador.material !== undefined) {
                marcador.mallaMarcador.material.opacity = escala;
            }
        }
    }
});

/**
 * Componente que representa un marcador físico en el espacio 3D.
 */
AFRAME.registerComponent('place-marker', {
    schema: {
        name: { type: 'string', default: AR_CONFIG.MARKER.DEFAULT_NAME },
        model: { type: 'asset' }
    },

    /**
     * Inicializa el componente y carga el modelo GLTF o una geometría por defecto.
     */
    init() {
        this.mallaMarcador = null;
        const elemento = this.el;
        const urlModelo = this.data.model;

        let esGltf = false;
        if (urlModelo !== undefined && urlModelo !== null) {
            const urlModeloMinusculas = urlModelo.toLowerCase();
            esGltf = urlModeloMinusculas.endsWith('.glb') || urlModeloMinusculas.endsWith('.gltf');
        }

        if (esGltf === true) {
            elemento.setAttribute('gltf-model', urlModelo);
            elemento.addEventListener('model-loaded', () => {
                elemento.object3D.traverse((nodo) => {
                    if (nodo.isMesh === true && this.mallaMarcador === null) {
                        this.mallaMarcador = nodo;
                        this.mallaMarcador.material.transparent = true;
                    }
                });
            });
        } else {
            elemento.setAttribute('geometry', AR_CONFIG.MARKER.DEFAULT_GEOMETRY);
            elemento.setAttribute('material', {
                shader: 'flat',
                src: urlModelo,
                transparent: true,
                side: 'double'
            });
            this.mallaMarcador = elemento.getObject3D('mesh');
        }

        elemento.object3D.position.y = AR_CONFIG.MARKER.HEIGHT_OFFSET;
        this.system.registrarMarcador(this);
    },

    /**
     * Función llamada cuando el componente es destruido. Lo elimina del sistema.
     */
    remove() {
        this.system.desregistrarMarcador(this);
    }
});