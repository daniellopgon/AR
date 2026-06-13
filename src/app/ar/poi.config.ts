import { InjectionToken } from '@angular/core';

export interface PoiConfig {
    visibilityRadius: number;
    defaultModel: string;
    points: {
        north: { name: string; lat: number; lng: number };
        south: { name: string; lat: number; lng: number };
    };
    simulation: {
        defaultAccuracy: number;
        highAccuracy: { value: number; delay: number };
        lowAccuracy: { value: number; delay: number };
    };
}

export const POI_CONFIG_DEFAULTS: PoiConfig = {
    visibilityRadius: 500,
    defaultModel: '',
    points: {
        north: {
            name: 'Punto Norte',
            lat: 40.99546,
            lng: -5.719779
        },
        south: {
            name: 'Punto Sur',
            lat: 40.99502,
            lng: -5.719779
        }
    },
    simulation: {
        defaultAccuracy: 10,
        highAccuracy: { value: 8, delay: 5000 },
        lowAccuracy: { value: 100, delay: 100 }
    }
};

export const POI_CONFIG = new InjectionToken<PoiConfig>('poi.config', {
    providedIn: 'root',
    factory: () => POI_CONFIG_DEFAULTS
});
