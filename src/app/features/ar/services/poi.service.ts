import { Injectable, inject, computed, signal } from '@angular/core';
import { GeoUtils } from '../../../core/utils/geo-utils';
import { DEFAULT_POIS } from '../../../shared/data/default-pois';
import { PointOfInterest, PoiView } from '../../../shared/models/poi.model';
import { POI_CONFIG } from '../../../core/config/poi.config';
import { ArStateService } from './ar-state.service';

@Injectable({ providedIn: 'root' })
export class PoiService {
    private readonly config = inject(POI_CONFIG);
    private readonly VISIBLE_RADIUS = this.config.visibilityRadius;
    private readonly state = inject(ArStateService);

    readonly poisResource = signal<PointOfInterest[]>(DEFAULT_POIS);

    readonly poisWithDistance = computed<PoiView[]>(() => {
        const userPos = this.state.userPosition();
        const currentPois = this.poisResource();

        if (!userPos) return [];

        return currentPois.map(poi => {
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

    readonly visiblePois = computed(() =>
        this.poisWithDistance().filter(poi => poi.isVisible)
    );
}
