import { Injectable, inject, computed, signal } from '@angular/core';
import { GeoUtils } from '../../utils/geo-utils';
import { DEFAULT_POIS } from '../../constants/default-pois';
import { PointOfInterest, PoiView } from '../../interfaces/poi-interfaces';
import { POI_CONFIG } from '../../poi.config';
import { ArStateService } from '../state/ar-state.service';

/**
 * Servicio encargado de gestionar el estado y los datos de los Puntos de Interés.
 * Calcula dinámicamente la distancia entre el usuario y cada punto, determinando
 * cuáles deben ser visibles en la pantalla basándose en el radio de visibilidad.
 */
@Injectable({ providedIn: 'root' })
export class PoiService {
    private readonly config = inject(POI_CONFIG);
    private readonly VISIBLE_RADIUS = this.config.visibilityRadius;
    private readonly state = inject(ArStateService);

    /**
     * Señal reactiva que almacena la lista cruda de Puntos de Interés.
     */
    readonly poisResource = signal<PointOfInterest[]>(DEFAULT_POIS);

    /**
     * Señal computada que transforma los POIs estáticos en vistas de POI.
     */
    readonly poisWithDistance = computed<PoiView[]>(() => {
        const userPos = this.state.userPosition();
        const currentPois = this.poisResource();

        if (!userPos) return [];

        return currentPois.map(poi => {
            // Calculamos la distancia real usando la fórmula de Haversine
            const distance = GeoUtils.haversine(userPos.lat, userPos.lng, poi.lat, poi.lng);

            return {
                ...poi,
                id: `poi-${poi.name}`,
                label: poi.name,
                distance,
                isVisible: distance <= this.VISIBLE_RADIUS,
                screenPosition: { x: 0, y: 0 }
            };
        }).sort((a, b) => a.distance - b.distance);
    });

    /**
     * Señal computada final consumida por los componentes visuales.
     * Filtra los POIs procesados para entregar únicamente aquellos 
     * que están dentro del radio de visión permitido.
     */
    readonly visiblePois = computed(() =>
        this.poisWithDistance().filter(poi => poi.isVisible)
    );
}
