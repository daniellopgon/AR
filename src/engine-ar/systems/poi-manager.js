import { AR_CONFIG } from '../ar-config';

AFRAME.registerSystem('poi-manager', {
    init: function () {
        this.pois = [];
        this.entityPool = new Map();
    },

    initializeEntities: function (allPois) {
        const scene = this.el;

        allPois.forEach((poi) => {
            console.log(`%c[MOVIL POI] ${poi.name}: ${poi.lat.toFixed(6)}, ${poi.lng.toFixed(6)}`, "color: cyan");
            const id = `poi-${poi.name}`;

            const entity = document.createElement('a-entity');
            entity.setAttribute('id', id);
            entity.setAttribute(AR_CONFIG.COMPONENTS.LOCAR_PLACE, {
                latitude: poi.lat,
                longitude: poi.lng || poi.lon
            });
            entity.setAttribute(AR_CONFIG.COMPONENTS.MARKER, {
                name: poi.name,
                model: AR_CONFIG.POI.DEFAULT_MODEL
            });
            entity.setAttribute('scale', AR_CONFIG.MARKER.SCALE.NEAR);
            entity.setAttribute('visible', false);

            scene.appendChild(entity);
            this.entityPool.set(id, entity);
        });
    },


    setMarkers: function (pois) {
        console.group('[POI-MANAGER] Recibido setMarkers');
        this.pois = pois;
        this.updateVisibility();
        console.groupEnd();
    },

    updateVisibility: function () {
        const scene = this.el;
        const allMarkers = scene.querySelectorAll('a-entity[place-marker]');

        allMarkers.forEach((marker) => {
            const markerId = marker.getAttribute('id');
            if (!this.entityPool.has(markerId)) {
                marker.remove();
            }
        });

        this.entityPool.forEach((entity, id) => {
            if (entity.object3D) {
                entity.object3D.visible = false;
            }
        });

        this.pois.forEach((poi) => {
            const id = `poi-${poi.name}`;
            const entity = this.entityPool.get(id);

            if (entity && entity.object3D) {
                entity.object3D.visible = true;
            }
        });
    }
});
