const _originalWatch = navigator.geolocation.watchPosition.bind(navigator.geolocation);
let _watchCount = 0;
navigator.geolocation.watchPosition = function (success: PositionCallback, error?: PositionErrorCallback | null, options?: PositionOptions) {
    _watchCount++;
    console.warn(`[GPS-AUDIT] watchPosition llamado ${_watchCount} vez/veces`);
    return _originalWatch(success, error, options);
};

import 'aframe';
import 'locar';
import './engine-ar/components/locar-camera-custom';
import './engine-ar/components/locar-entity-place';

import './engine-ar/components/place-marker.js';
import './engine-ar/components/occluder-component.js';
import './engine-ar/systems/stability-system.js';
import './engine-ar/systems/poi-manager.js';

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

await bootstrapApplication(AppComponent, appConfig);