export interface PointOfInterest {
    readonly name: string;
    readonly lat: number;
    readonly lng: number;
    readonly model: string;
}

export interface PoiView extends PointOfInterest {
    readonly id: string;
    readonly label: string;
    readonly distance: number;
    readonly isVisible: boolean;
    readonly screenPosition: {
        readonly x: number;
        readonly y: number;
    };
}