declare const AFRAME: any;
import * as LocAR from 'locar';

import { AR_CONFIG } from '../ar-config';

AFRAME.registerComponent('locar-camera-custom', {
    init(this: any) {
        const THREE = AFRAME.THREE;
        const scene = this.el.sceneEl.object3D;
        const camera = this.el.getObject3D('camera');

        if (!camera) return;

        const gpsOptions = {
            gpsMinDistance: 7,
            gpsMinAccuracy: 10
        };

        this.locar = new LocAR.LocationBased(scene, camera, gpsOptions);
        this.locar.setElevation(AR_CONFIG.GPS.ELEVATION);
        this.el.components['locar-camera-custom'].locar = this.locar;
        this.locar.startGps();

        this.hasPosition = false;

        this.locar.on('gpsupdate', (event: any) => {

            if (!event.position?.coords || event.distMoved > 1000000) {
                console.warn('[GPS-GUARD] Evento ignorado: Datos incompletos o distancia imposible.');
                return;
            }

            const latFilt = event.position.coords.latitude;
            const lonFilt = event.position.coords.longitude;

            console.warn(`[LocAR OUT] ACEPTADO Dist: ${event.distMoved.toFixed(2)}m | Lat ${latFilt}, Lon ${lonFilt}`);

            if (!this.hasPosition) {
                const coords = event.position?.coords;
                if (!coords) return;
                const lat = coords.latitude;
                const lon = coords.longitude;

                const calibrationBoxes = [
                    { latDis: 0.0005, lonDis: 0, color: 0xff0000 },
                    { latDis: -0.0005, lonDis: 0, color: 0xffff00 },
                    { latDis: 0, lonDis: -0.0005, color: 0x00ffff },
                    { latDis: 0, lonDis: 0.0005, color: 0x00ff00 },
                ];

                const geom = new THREE.BoxGeometry(10, 10, 10);

                calibrationBoxes.forEach(box => {
                    const mesh = new THREE.Mesh(
                        geom,
                        new THREE.MeshBasicMaterial({ color: box.color })
                    );
                    this.locar.add(mesh, lon + box.lonDis, lat + box.latDis);
                });

                this.el.emit('gps-initial-position-determined', event);
                this.hasPosition = true;
            }

            queueMicrotask(() => {
                const coords = event.position?.coords;
                if (!coords) return;
                globalThis.dispatchEvent(new CustomEvent(AR_CONFIG.EVENTS.GPS_UPDATE, {
                    detail: {
                        distMoved: event.distMoved,
                        lat: coords.latitude,
                        lng: coords.longitude,
                        accuracy: coords.accuracy
                    }
                }));
            });
        });

        const orientationOptions = {
            smoothingFactor: AR_CONFIG.ORIENTATION.SMOOTHING_FACTOR,
            orientationChangeThreshold: AR_CONFIG.ORIENTATION.CHANGE_THRESHOLD,
            enablePermissionDialog: AR_CONFIG.ORIENTATION.ENABLE_PERMISSION_DIALOG
        };

        this.orientationControls = new LocAR.DeviceOrientationControls(camera, orientationOptions);

        this.orientationControls.on('deviceorientationgranted', () => {
            this.orientationControls.connect();
        });

        this.orientationControls.init();
    },

    tick(this: any) {
        if (this.orientationControls) {
            this.orientationControls.update();
        }
    },

    remove(this: any) {
        if (this.orientationControls) {
            this.orientationControls.dispose();
        }
    },

    add(this: any, object: any, lon: number, lat: number) {
        if (this.locar) {
            this.locar.add(object, lon, lat);
        }
    }
});

