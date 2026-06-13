import { ErrorHandler, Injectable, inject, NgZone } from '@angular/core';
import { NotificationService } from '../state/notification.state';
import { ERROR_MESSAGES } from '../constants/ui-resources';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    private readonly notificationService = inject(NotificationService);
    private readonly zone = inject(NgZone);

    handleError(error: any): void {
        const message = error?.message || ERROR_MESSAGES.UNKNOWN;

        console.error(`[CORE] Global Error Captured: ${message}`, error);

        this.zone.run(() => {
            if (message.includes('NotAllowedError') || message.includes('Permission denied')) {
                this.notificationService.showError(ERROR_MESSAGES.PERMISSION_DENIED);
            } else if (message.includes('WebGL')) {
                this.notificationService.showError(ERROR_MESSAGES.WEBGL_UNSUPPORTED);
            } else {
                this.notificationService.showError(ERROR_MESSAGES.UNEXPECTED);
            }
        });
    }
}

