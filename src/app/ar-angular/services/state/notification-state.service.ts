import { Injectable, signal } from '@angular/core';

// Interfaz para definir el tipo de mensaje
export interface ToastMessage {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

// Servicio para manejar las notificaciones
@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    // Señal privada para manejar las notificaciones
    readonly #messages = signal<ToastMessage[]>([]);
    
    // Señal pública de solo lectura
    readonly messages = this.#messages.asReadonly();

    // Contador para generar los ids de las notificaciones
    private counter = 0;

    // Metodos para mostrar los diferentes tipos de notificaciones
    showError(message: string) {
        this.add(message, 'error');
    }

    showSuccess(message: string) {
        this.add(message, 'success');
    }

    showInfo(message: string) {
        this.add(message, 'info');
    }

    // Metodo privado para añadir las notificaciones
    private add(message: string, type: ToastMessage['type']) {
        const id = this.counter++;
        this.#messages.update(msgs => [...msgs, { id, message, type }]);

        setTimeout(() => this.remove(id), 5000);
    }

    remove(id: number) {
        this.#messages.update(msgs => msgs.filter(msg => msg.id !== id));
    }
}
