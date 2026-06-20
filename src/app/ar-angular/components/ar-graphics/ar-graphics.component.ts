import { Component, ChangeDetectionStrategy, ElementRef, viewChild } from '@angular/core';

/**
 * Componente que gestiona el feed de la cámara trasera del dispositivo.
 * Muestra el vídeo a pantalla completa como fondo para la experiencia AR.
 */
@Component({
    selector: 'app-ar-graphics',
    templateUrl: './ar-graphics.component.html',
    styleUrl: './ar-graphics.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArGraphicsComponent {
    readonly videoRef = viewChild<ElementRef<HTMLVideoElement>>('videoElement');

    /**
     * Asigna un stream de cámara al elemento de vídeo.
     */
    setVideoStream(stream: MediaStream): void {
        const video = this.videoRef()?.nativeElement;
        if (!video) {
            return;
        }

        video.srcObject = stream;
        video.play().catch(() => { });
    }
}
