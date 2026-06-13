import { ApplicationConfig, provideZonelessChangeDetection, ErrorHandler, APP_INITIALIZER, inject } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { GlobalErrorHandler } from './core/errors/global-error-handler';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withFetch()),
        { provide: ErrorHandler, useClass: GlobalErrorHandler },

    ]
};
