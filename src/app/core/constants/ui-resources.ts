export const AR_TEXT = {
    LOADING_GPS: 'Esperando señal GPS...',
    GPS_ACTIVE: 'GPS Activo',
    VISIBLE_POIS: 'POIs visibles',
    MAP_HIDE: 'Ocultar Mapa',
    MAP_SHOW: 'Ver Mapa',
    INITIALIZE_AR: 'Pulsa para iniciar vista RA',
    LOADING_ENGINE: 'Cargando motor de RA...',
    METERS_UNIT: 'm',
    LATITUDE_LABEL: 'latitud',
    LONGITUDE_LABEL: 'longitud',
    STABLE: 'ESTABLE',
    CALIBRATING: 'CALIBRANDO...',
    GPS_ACC: 'GPS ACC: ',
    CAM_Y: 'CAM Y: ',
    POI_COUNT: 'POIs: '
} as const;

export const ERROR_MESSAGES = {
    UNKNOWN: 'Error desconocido',
    PERMISSION_DENIED: 'Acceso a cámara/GPS denegado. Revisa los permisos.',
    WEBGL_UNSUPPORTED: 'Tu dispositivo no soporta WebGL para RA.',
    UNEXPECTED: 'Ocurrió un error inesperado.',
    SERVER_ERROR: 'Error en el servidor. Inténtalo más tarde.',
    GPS_UNAVAILABLE: 'No se pudo obtener la ubicación GPS.',
    RENDER_LOOP: '[RENDER] Error en callback del bucle de renderizado:',
} as const;

export const GPS_ERROR_CODES = {
    UNSUPPORTED: 'GPS_UNSUPPORTED',
    PERMISSION_DENIED: 'GPS_PERMISSION_DENIED',
    POSITION_UNAVAILABLE: 'GPS_POSITION_UNAVAILABLE',
    TIMEOUT: 'GPS_TIMEOUT',
    UNKNOWN: 'GPS_UNKNOWN'
} as const;
