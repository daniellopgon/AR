import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    readonly messages = signal<ToastMessage[]>([]);

    private counter = 0;

    showError(message: string) {
        this.add(message, 'error');
    }

    showSuccess(message: string) {
        this.add(message, 'success');
    }

    showInfo(message: string) {
        this.add(message, 'info');
    }

    private add(message: string, type: ToastMessage['type']) {
        const id = this.counter++;
        this.messages.update(msgs => [...msgs, { id, message, type }]);

        setTimeout(() => this.remove(id), 5000);
    }

    remove(id: number) {
        this.messages.update(msgs => msgs.filter(msg => msg.id !== id));
    }
}
