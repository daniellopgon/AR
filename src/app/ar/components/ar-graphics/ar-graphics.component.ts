import { Component, ChangeDetectionStrategy, inject, ElementRef, viewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ArStateService } from '../../services/ar-state.service';
import { AR_CONFIG } from '../../../../engine-ar/ar-config';

@Component({
  selector: 'app-ar-graphics',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './ar-graphics.component.html',
  styleUrl: './ar-graphics.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArGraphicsComponent {
  protected readonly state = inject(ArStateService);

  public readonly sceneRef = viewChild<ElementRef>('scene');
  readonly cameraRef = viewChild<ElementRef>('camera');
  readonly videoRef = viewChild<ElementRef<HTMLVideoElement>>('videoElement');

  protected readonly occluderConfig = `width: ${AR_CONFIG.OCCLUDER.GEOMETRY[0]}; height: ${AR_CONFIG.OCCLUDER.GEOMETRY[1]}; depth: ${AR_CONFIG.OCCLUDER.GEOMETRY[2]}`;

  constructor() {
    this.iniciarBucleSeguimiento();
  }

  private iniciarBucleSeguimiento(): void {
    let lastY = 0;

    const actualizarPosicion = () => {
      const cameraEl = this.cameraRef()?.nativeElement;
      const y = cameraEl?.object3D?.position?.y ?? 0;

      if (Math.abs(y - lastY) > 0.05) {
        lastY = y;
        this.state.updateCameraHeight(y);
      }

      requestAnimationFrame(actualizarPosicion);
    };

    requestAnimationFrame(actualizarPosicion);
  }

  protected onStable(): void {
    this.state.setStabilized(true);
  }

  protected onCameraError(event: any): void {
    console.error('[AR] Camera Error:', event);
  }

  public setVideoStream(stream: MediaStream): void {
    const video = this.videoRef()?.nativeElement;
    if (!video) return;

    video.srcObject = stream;
    video.style.display = 'block';

    video.play().catch(() => { });
  }
}
