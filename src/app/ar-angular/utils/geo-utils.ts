export class GeoUtils {
    private static readonly R = 6371e3;

    static haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const phi1 = lat1 * Math.PI / 180;
        const phi2 = lat2 * Math.PI / 180;
        const deltaPhi = (lat2 - lat1) * Math.PI / 180;
        const deltaLambda = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return this.R * c;
    }
}

/** Distancia en metros a la que el libro se abre y reduce tamaño */
export const DISTANCIA_ABRIR_LIBRO = 7;

/** Distancia en metros a la que el marcador desaparece */
export const DISTANCIA_ESCALA_MAXIMA = 25;

/** Escala mínima del marcador (lejano) */
export const ESCALA_MINIMA = 0.3;

/** Escala máxima del marcador (radio de 7m) */
export const ESCALA_MAXIMA = 1.5;

/**
 * Calcula el factor de escala:
 * - Lejos 25m: 0.3
 * - Radio de apertura <= 7m: 1.0 tamaño constante
 */
export const calcularEscala = (distancia: number): number => {
    if (distancia <= DISTANCIA_ABRIR_LIBRO) {
        return ESCALA_MAXIMA;
    } else {
        const distanciaClamped = Math.min(distancia, DISTANCIA_ESCALA_MAXIMA);
        const progreso = (DISTANCIA_ESCALA_MAXIMA - distanciaClamped) / (DISTANCIA_ESCALA_MAXIMA - DISTANCIA_ABRIR_LIBRO);
        return ESCALA_MINIMA + progreso * (ESCALA_MAXIMA - ESCALA_MINIMA);
    }
};

/**
 * Calcula la opacidad del marcador. Empieza a desvanecerse al 70% del umbral máximo.
 */
export const calcularOpacidad = (distancia: number): number => {
    const umbralInicio = DISTANCIA_ESCALA_MAXIMA * 0.7;
    if (distancia < umbralInicio) {
        return 1;
    }
    const progreso = (distancia - umbralInicio) / (DISTANCIA_ESCALA_MAXIMA - umbralInicio);
    return Math.max(0, 1 - progreso);
};
