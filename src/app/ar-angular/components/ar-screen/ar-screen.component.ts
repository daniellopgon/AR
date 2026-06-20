import { Component, ChangeDetectionStrategy, inject, viewChild, afterRenderEffect, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArGraphicsComponent } from '../ar-graphics/ar-graphics.component';
import { ArHudComponent } from '../ar-hud/ar-hud.component';
import { PoiService } from '../../services/data/poi-data.service';
import { PermissionsService } from '../../services/infraestructure/permissions-infraestructure.service';
import { from, EMPTY, throwError } from 'rxjs';
import { concatMap, catchError } from 'rxjs/operators';
import { PoiManagerSystem, AFrameSceneElement } from '../../interfaces/poi-interfaces';


@Component({
  selector: 'app-ar-screen',
  imports: [CommonModule, ArGraphicsComponent, ArHudComponent],
  templateUrl: './ar-screen.component.html',
  styleUrl: './ar-screen.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

// Componente contenedor de la app de AR
export class ArScreenComponent {
  protected readonly poiService = inject(PoiService);
  private readonly permissionsService = inject(PermissionsService);

  // Instancia del componente que pinta la escena 3D de AR
  readonly graphics = viewChild<ArGraphicsComponent>('graphics');

  constructor() {
    this.sincronizarDatosMotor(); // sincroniza los poi con la escena 3D

    // funcion que se ejecuta cuando el componente se ha renderizado
    afterNextRender(() => {
      this.iniciarCamara(); // inicia la camara
      this.iniciarAFrame(); // inicia AFrame
    });
  }

  // Inicializa AFrame y carga los POI
  private iniciarAFrame(): void {
    const sceneEl = this.graphics()?.sceneRef()?.nativeElement as AFrameSceneElement | undefined;
    if (!sceneEl) return;

    if (sceneEl.hasLoaded) {
      this.inicializarPoisAFrame(sceneEl);
    } else {
      sceneEl.addEventListener('loaded', () => this.inicializarPoisAFrame(sceneEl));
    }
  }

  // Inicializa los POI en la escena de AFrame
  private inicializarPoisAFrame(sceneEl: AFrameSceneElement): void {
    const poiManager = sceneEl.systems['poi-manager'];

    if (poiManager && (!poiManager.grupoEntidades || poiManager.grupoEntidades.size === 0)) {
      const allPois = this.poiService.poisResource();
      poiManager.inicializarEntidades(allPois);
    }
  }

  // Inicia la camara y solicita permisos
  private iniciarCamara(): void {
    this.permissionsService.requestCameraPermission().pipe(
      concatMap(tienePermiso => {
        if (!tienePermiso) return throwError(() => new Error('Permiso de cámara denegado'));

        return from(navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        }));
      }),
      catchError(errorCapturado => {
        console.error('Error al iniciar la cámara:', errorCapturado);
        return EMPTY;
      })
    ).subscribe(streamCamara => {
      const componenteGraficos = this.graphics();
      if (componenteGraficos) {
        componenteGraficos.setVideoStream(streamCamara);
      }
    });
  }

  // Sincroniza los POI con la escena 3D
  private sincronizarDatosMotor(): void {
    afterRenderEffect(() => {
      const pois = this.poiService.visiblePois();
      const graphicsComp = this.graphics();

      if (graphicsComp) {
        this.actualizarEscena(pois);
      }
    });
  }

  // Actualiza los POI en la escena de AFrame
  private actualizarEscena(pois: unknown[]): void {
    const sceneEl = this.graphics()?.sceneRef()?.nativeElement as AFrameSceneElement | undefined;
    if (!sceneEl) return;

    const poiManager = sceneEl.systems['poi-manager'];
    poiManager?.establecerMarcadores(pois);
  }
}