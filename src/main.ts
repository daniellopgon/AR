const _originalWatch = navigator.geolocation.watchPosition.bind(navigator.geolocation);
let _watchCount = 0;
navigator.geolocation.watchPosition = function (success: PositionCallback, error?: PositionErrorCallback | null, options?: PositionOptions) {
    _watchCount++;
    console.warn(`[GPS-AUDIT] watchPosition llamado ${_watchCount} vez/veces`);
    return _originalWatch(success, error, options);
};

import 'aframe';
import 'locar';
import './engine-ar/components/locar-camera-custom-component';
import './engine-ar/components/locar-entity-place-component';

import './engine-ar/components/place-marker-component';
import './engine-ar/components/occluder-component';
import './engine-ar/systems/stability-system';
import './engine-ar/systems/poi-manager-system';

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/ar-angular/app.config';
import { AppComponent } from './app/ar-angular/app.component';

await bootstrapApplication(AppComponent, appConfig);