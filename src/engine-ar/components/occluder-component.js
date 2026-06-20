"use strict";

import { AR_CONFIG } from '../ar-config';

/**
 * Componente que crea una malla invisible que esconde otros objetos 3D.
 */
AFRAME.registerComponent(AR_CONFIG.COMPONENTS.OCCLUDER, {
    schema: {
        width: { type: 'number', default: 20 },
        height: { type: 'number', default: 10 },
        depth: { type: 'number', default: 2 }
    },

    /**
     * Inicializa el componente.
     */
    init() {
        this.crearMallaOcultadora();
    },

    /**
     * Crea y aplica la geometría y el material que actúan como oclusor.
     */
    crearMallaOcultadora() {
        const geometria = new THREE.BoxGeometry(this.data.width, this.data.height, this.data.depth);
        const material = new THREE.MeshBasicMaterial({ colorWrite: false });
        const malla = new THREE.Mesh(geometria, material);

        malla.renderOrder = 0;
        this.el.setObject3D('mesh', malla);
    }
});
