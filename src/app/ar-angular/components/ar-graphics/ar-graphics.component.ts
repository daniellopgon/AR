import { Component, ChangeDetectionStrategy, inject, ElementRef, viewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ArStateService } from '../../services/state/ar-state.service';
import { AR_CONFIG } from '../../../../engine-ar/ar-config';

@Component({
  selector: 'app-ar-graphics',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './ar-graphics.component.html',
  styleUrl: './ar-graphics.component.css',
  // solo se actualiza si detecta cambios
  changeDetection: ChangeDetectionStrategy.OnPush
})
// Componente que pinta la escena 3D de AR
export class ArGraphicsComponent {
  protected readonly state = inject(ArStateService);

  public readonly sceneRef = viewChild<ElementRef>('scene');
  readonly cameraRef = viewChild<ElementRef>('camera');
  readonly videoRef = viewChild<ElementRef<HTMLVideoElement>>('videoElement');

  // valores de configuracion del ocluder
  protected readonly occluderConfig = `width: ${AR_CONFIG.OCCLUDER.GEOMETRY[0]}; height: ${AR_CONFIG.OCCLUDER.GEOMETRY[1]}; depth: ${AR_CONFIG.OCCLUDER.GEOMETRY[2]}`;

  // muestra si la señal del gps es estable
  protected onStable(): void {
    this.state.setStabilized(true);
  }

  // maneja errores de la camara
  protected onCameraError(event: any): void {
    console.error('[AR] Camera Error:', event);
  }

  // asigna el stream de video a la camara
  public setVideoStream(stream: MediaStream): void {
    const video = this.videoRef()?.nativeElement;
    if (!video) return;

    video.srcObject = stream;
    video.style.display = 'block';

    video.play().catch(() => { });
  }
}
