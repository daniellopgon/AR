import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { PoiService } from '../../services/data/poi-data.service';
import { PoiView } from '../../interfaces/poi-interfaces';

/** Distancia en metros a la que el marcador tiene tamaño máximo */
const DISTANCIA_ESCALA_MINIMA = 5;

/** Distancia en metros a la que el marcador desaparece */
const DISTANCIA_ESCALA_MAXIMA = 200;

/** Escala mínima del marcador (lejano) */
const ESCALA_MINIMA = 0.3;

/** Escala máxima del marcador (cercano) */
const ESCALA_MAXIMA = 1.5;

/**
 * Calcula el factor de escala de un marcador según su distancia GPS.
 */
const calcularEscala = (distancia: number): number => {
    const distanciaClamped = Math.max(DISTANCIA_ESCALA_MINIMA, Math.min(distancia, DISTANCIA_ESCALA_MAXIMA));
    const rango = DISTANCIA_ESCALA_MAXIMA - DISTANCIA_ESCALA_MINIMA;
    const progreso = (distanciaClamped - DISTANCIA_ESCALA_MINIMA) / rango;
    return ESCALA_MAXIMA - progreso * (ESCALA_MAXIMA - ESCALA_MINIMA);
};

/**
 * Calcula la opacidad del marcador según su distancia GPS.
 */
const calcularOpacidad = (distancia: number): number => {
    const umbralInicio = DISTANCIA_ESCALA_MAXIMA * 0.7;
    if (distancia < umbralInicio) {
        return 1;
    }
    const progreso = (distancia - umbralInicio) / (DISTANCIA_ESCALA_MAXIMA - umbralInicio);
    return Math.max(0.2, 1 - progreso);
};

/**
 * Componente que renderiza los marcadores POI como overlays HTML
 * superpuestos al feed de cámara, simulando AR.
 */
@Component({
    selector: 'app-ar-markers-overlay',
    standalone: true,
    templateUrl: './ar-markers-overlay.component.html',
    styleUrl: './ar-markers-overlay.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArMarkersOverlayComponent {
    private readonly poiService = inject(PoiService);

    /**
     * Señal computada con los marcadores visibles y sus estilos calculados.
     */
    protected readonly marcadoresVisibles = computed(() => {
        const pois = this.poiService.poisWithDistance();
        const visibles = pois.filter(poi => poi.isVisible);

        return visibles.map((poi, indice) => ({
            ...poi,
            escala: calcularEscala(poi.distance),
            opacidad: calcularOpacidad(poi.distance),
            posicionPantalla: this.#calcularPosicionPantalla(indice, visibles.length)
        }));
    });

    /**
     * Distribuye marcadores en la pantalla para que no se solapen.
     */
    #calcularPosicionPantalla(indice: number, total: number): { x: number; y: number } {
        if (total === 1) {
            return { x: 50, y: 50 };
        }

        const columnas = Math.min(total, 3);
        const filas = Math.ceil(total / columnas);
        const fila = Math.floor(indice / columnas);
        const columna = indice % columnas;

        const margenHorizontal = 20;
        const margenVertical = 25;
        const anchoUtil = 100 - margenHorizontal * 2;
        const altoUtil = 100 - margenVertical * 2;

        const espacioX = columnas > 1 ? anchoUtil / (columnas - 1) : 0;
        const espacioY = filas > 1 ? altoUtil / (filas - 1) : 0;

        return {
            x: margenHorizontal + columna * espacioX,
            y: margenVertical + fila * espacioY
        };
    }

    /**
     * Formatea la distancia para mostrar en pantalla.
     */
    protected formatearDistancia(distancia: number): string {
        if (distancia < 1000) {
            return `${Math.round(distancia)}m`;
        }
        return `${(distancia / 1000).toFixed(1)}km`;
    }

    /**
     * TrackBy para el @for de Angular.
     */
    protected trackPorId(_indice: number, poi: PoiView): string {
        return poi.id;
    }
}
