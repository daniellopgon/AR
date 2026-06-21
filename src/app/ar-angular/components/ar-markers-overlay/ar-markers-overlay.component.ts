import { Component, ChangeDetectionStrategy, inject, computed, effect, signal } from '@angular/core';
import { PoiService } from '../../services/data/poi-data.service';
import { calcularEscala, calcularOpacidad, DISTANCIA_ABRIR_LIBRO } from '../../utils/geo-utils';


/**
 * Componente que renderiza el POI más cercano como un libro 3D interactivo.
 */
@Component({
    selector: 'app-ar-markers-overlay',
    standalone: true,
    templateUrl: './ar-markers-overlay.component.html',
    styleUrl: './ar-markers-overlay.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArMarkersOverlayComponent {
    private readonly poiService = inject(PoiService);
    private ultimoLibroAbiertoId: string | null = null;

    // Estado de la firma
    readonly haFirmado = signal<boolean>(false);
    readonly firmaActual = signal<string>('');

    // Estado para fijar el libro y animar su desaparición
    readonly marcadorFijado = signal<any | null>(null);
    readonly desvaneciendo = signal<boolean>(false);

    constructor() {
        // Efecto reactivo que observa cuándo el marcador se abre para reproducir el sonido y fijarlo
        effect(() => {
            if (this.marcadorFijado()) return;

            const marcador = this.marcadorEnVista();

            // Si no hay marcador en vista, reseteamos el ID
            if (!marcador) {
                this.ultimoLibroAbiertoId = null;
                return;
            }

            // Si hay marcador pero no está abierto
            if (!marcador.isOpen) {
                if (this.ultimoLibroAbiertoId === marcador.id) {
                    this.ultimoLibroAbiertoId = null;
                }
                return;
            }

            // Si llegamos aquí, el marcador existe y acaba de abrirse
            this.marcadorFijado.set(marcador);

            if (this.ultimoLibroAbiertoId !== marcador.id) {
                this.ultimoLibroAbiertoId = marcador.id;
                this.#reproducirSonidoApertura();
            }
        }, { allowSignalWrites: true });
    }

    /**
     * Señal computada que evalúa el marcador más cercano y su distancia.
     */
    protected readonly marcadorEnVista = computed(() => {
        const visibles = this.poiService.visiblePois();
        const masCercano = visibles[0] ?? null;

        if (!masCercano) return null;

        return {
            ...masCercano,
            escala: calcularEscala(masCercano.distance),
            opacidad: calcularOpacidad(masCercano.distance),
            isOpen: masCercano.distance <= DISTANCIA_ABRIR_LIBRO
        };
    });

    /**
     * Señal computada final que la vista consume.
     * Si el libro está fijado, mantiene sus valores estables al máximo.
     */
    protected readonly marcadorCercano = computed(() => {
        const fijado = this.marcadorFijado();

        if (!fijado) return this.marcadorEnVista();

        if (this.desvaneciendo()) {
            return { ...fijado, escala: 1, opacidad: 0, isOpen: false };
        }

        return { ...fijado, escala: 1, opacidad: 1, isOpen: true };
    });

    /**
     * Reproduce un archivo de audio real cuando se abre el libro.
     */
    #reproducirSonidoApertura(): void {
        console.log("¡SONIDO HISTÓRICO REPRODUCIDO DESDE ARCHIVO!");
        const audio = new Audio('assets/lesiakower-ancient-lyre-sound-short-arpeggio-sound-effect-430628.mp3');
        audio.play().catch(e => console.warn('El navegador bloqueó el autoplay del sonido.', e));
    }

    dejarFirma(nombre: string): void {
        if (!nombre.trim()) return;
        this.firmaActual.set(nombre);
        this.haFirmado.set(true);

        // Muestra la firma durante 2.5 segundos, luego activa el cierre suave
        setTimeout(() => {
            this.desvaneciendo.set(true);

            // Tras 1 segundo (lo que dura la transición CSS de cerrado), reseteamos todo el componente
            setTimeout(() => {
                this.marcadorFijado.set(null);
                this.desvaneciendo.set(false);
                this.haFirmado.set(false);
                this.firmaActual.set('');
            }, 1000);
        }, 2500);
    }
}
