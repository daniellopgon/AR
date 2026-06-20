import { Injectable, OnDestroy } from '@angular/core';
import { ERROR_MESSAGES } from '../../constants/ui-resources';

/**
 * Servicio de infraestructura encargado de centralizar y gestionar el bucle de renderizado 
 * principal de la aplicación mediante requestAnimationFrame.
 * Permite a múltiples componentes registrarse para ejecutarse a 60 FPS de forma coordinada,
 * encendiendo y apagando el motor de renderizado de forma inteligente para ahorrar batería.
 */
@Injectable({
    providedIn: 'root'
})
export class RenderLoopService implements OnDestroy {
    // Colección única para evitar que la misma función de animación se registre duplicada
    private readonly callbacks = new Set<FrameRequestCallback>();

    // Identificador nativo del fotograma actual, usado para poder cancelarlo
    private animationFrameId: number | null = null;

    // Bandera de control para saber el estado del motor
    private isRunning = false;

    /**
     * Registra una función para que se ejecute en cada fotograma del motor de renderizado.
     * Si el motor estaba apagado y hay funciones registradas, se encenderá automáticamente.
     * 
     */
    register(callback: FrameRequestCallback): void {
        this.callbacks.add(callback);
        if (!this.isRunning && this.callbacks.size > 0) {
            this.startLoop();
        }
    }

    /**
     * Da de baja una función previamente registrada en el motor de renderizado.
     * Si ya no quedan más funciones registradas, el motor se apaga automáticamente.
     * 
     */
    unregister(callback: FrameRequestCallback): void {
        this.callbacks.delete(callback);
        if (this.callbacks.size === 0) {
            this.stopLoop();
        }
    }

    /**
     * Arranca el bucle nativo del navegador.
     * Itera sobre todas las funciones registradas ejecutándolas de forma síncrona.
     */
    private startLoop(): void {
        if (this.isRunning) return;
        this.isRunning = true;

        const loop = (time: number) => {
            if (!this.isRunning) return;

            // Ejecutamos cada función en un entorno seguro para evitar que el fallo
            // de un único componente colapse todo el bucle de renderizado
            this.callbacks.forEach(cb => {
                try {
                    cb(time);
                } catch (error) {
                    console.error(ERROR_MESSAGES.RENDER_LOOP, error);
                }
            });

            // Programamos el siguiente fotograma
            this.animationFrameId = requestAnimationFrame(loop);
        };

        //iniciar el bucle
        this.animationFrameId = requestAnimationFrame(loop);
    }

    /**
     * Detiene la petición de fotogramas al navegador, parando el motor por completo
     * y ahorrando recursos de hardware.
     */
    private stopLoop(): void {
        this.isRunning = false;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Método del ciclo de vida de Angular.
     * Garantiza una limpieza total de memoria y detiene el motor si el servicio es destruido.
     */
    ngOnDestroy(): void {
        this.stopLoop();
        this.callbacks.clear();
    }
}
