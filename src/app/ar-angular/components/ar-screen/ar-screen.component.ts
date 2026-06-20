import { Component, ChangeDetectionStrategy, inject, viewChild, afterRenderEffect, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArGraphicsComponent } from '../ar-graphics/ar-graphics.component';
import { ArHudComponent } from '../ar-hud/ar-hud.component';
import { PoiService } from '../../services/data/poi-data.service';
import { PermissionsService } from '../../services/infraestructure/permissions-infraestructure.service';
import { from, EMPTY, throwError } from 'rxjs';
import { concatMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-ar-screen',
  imports: [CommonModule, ArGraphicsComponent, ArHudComponent],
  templateUrl: './ar-screen.component.html',
  styleUrl: './ar-screen.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArScreenComponent implements AfterViewInit {
  protected readonly poiService = inject(PoiService);
  private readonly permissionsService = inject(PermissionsService);

  readonly graphics = viewChild<ArGraphicsComponent>('graphics');

  constructor() {
    this.sincronizarDatosMotor();
  }

  ngAfterViewInit(): void {
    this.iniciarCamara();

    setTimeout(() => {
      const graphicsComp = this.graphics();
      const sceneEl = (graphicsComp as any)?.sceneRef()?.nativeElement;
      const poiManager = sceneEl?.systems?.['poi-manager'];

      if (poiManager?.entityPool.size === 0) {
        const allPois = this.poiService.poisResource();
        poiManager.inicializarEntidades(allPois);
      }
    }, 100);
  }

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

  private sincronizarDatosMotor(): void {
    afterRenderEffect(() => {
      const pois = this.poiService.visiblePois();
      const graphicsComp = this.graphics();

      if (graphicsComp) {
        this.actualizarEscena(pois);
      }
    });
  }

  private actualizarEscena(pois: any[]): void {
    const graphicsComp = this.graphics();
    const sceneEl = (graphicsComp as any)?.sceneRef()?.nativeElement;
    if (!sceneEl) return;

    const poiManager = sceneEl.systems['poi-manager'];
    poiManager?.establecerMarcadores(pois);
  }
}