import { AR_CONFIG } from '../ar-config';

AFRAME.registerComponent(AR_CONFIG.COMPONENTS.OCCLUDER, {
    schema: {
        width: { type: 'number', default: 20 },
        height: { type: 'number', default: 10 },
        depth: { type: 'number', default: 2 }
    },

    init: function () {
        this.createOccluderMesh();
    },

    createOccluderMesh: function () {
        const geometry = new THREE.BoxGeometry(this.data.width, this.data.height, this.data.depth);
        const material = new THREE.MeshBasicMaterial({ colorWrite: false });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = 0;
        this.el.setObject3D('mesh', mesh);
    }
});
