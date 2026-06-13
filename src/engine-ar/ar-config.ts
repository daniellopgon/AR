export const AR_CONFIG = {
    GPS: {
        MIN_DISTANCE: 5,
        MIN_ACCURACY: 100,
        ELEVATION: 1.6
    },
    ORIENTATION: {
        SMOOTHING_FACTOR: 0.1,
        CHANGE_THRESHOLD: 0.02,
        ENABLE_PERMISSION_DIALOG: false
    },
    EVENTS: {
        GPS_UPDATE: 'locar-gps-update'
    },
    MARKER: {
        NEAR_THRESHOLD: 50,
        DEFAULT_NAME: 'Lugar Desconocido',
        DEFAULT_GEOMETRY: 'primitive: plane; width: 1; height: 1',
        HEIGHT_OFFSET: 1.6,
        SCALE: {
            NEAR: '5 5 5',
            FAR: '5 5 5'
        },
        DEFAULT_MODEL_PATH: './assets/daremapp/marcador.png'
    },
    SYSTEM: {
        LOCAR_CAMERA_SELECTOR: '[locar-camera-custom]',
        LOOK_AT_TARGET: '[camera]'
    },
    COMPONENTS: {
        LOCAR_PLACE: 'locar-entity-place',
        MARKER: 'place-marker',
        OCCLUDER: 'ar-occluder'
    },
    STABILITY: {
        Y_MIN: 1,
        ACCURACY_MAX: 20
    },
    AVATAR: {
        LERP_FACTOR: 0.1,
        INITIAL_ACCURACY: 999
    },
    FADE: {
        START: 40,
        END: 50,
        BASE_SCALE: 5
    },
    OCCLUDER: {
        GEOMETRY: [20, 10, 2],
        POSITION: [0, 2.5, -10],
        COLOR: 0x00ff00
    },
    UI: {
        STABLE: 'ESTABLE',
        CALIBRATING: 'CALIBRANDO...',
        GPS: 'GPS ACC: ',
        CAM: 'CAM Y: ',
        METERS: 'm'
    },
    POI: {
        DEFAULT_MODEL: './assets/daremapp/marcador.png',
        POLLING_INTERVAL: 3000,
        TRIGGER_DISTANCE: 20
    }
} as const;

