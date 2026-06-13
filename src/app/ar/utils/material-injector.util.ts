import { AR_CONFIG } from '../../../../engine-ar/ar-config';

declare const THREE: any;

export interface AvatarUniforms {
    uAvatarPos: { value: any };
}

export class MaterialInjector {
    static injectAvatarDistanceFade(
        material: any,
        avatarUniforms: AvatarUniforms,
        fadeStart: number = AR_CONFIG.FADE.START,
        fadeEnd: number = AR_CONFIG.FADE.END
    ): void {
        this.configurarMaterialPuro(material);
        this.inyectarShaders(material, avatarUniforms, fadeStart, fadeEnd);
    }

    private static configurarMaterialPuro(material: any): void {
        material.transparent = true;
        material.depthWrite = false;
        material.needsUpdate = true;
    }

    private static inyectarShaders(material: any, uniforms: AvatarUniforms, start: number, end: number): void {
        material.onBeforeCompile = (shader: any) => {
            shader.uniforms.uAvatarPos = uniforms.uAvatarPos;
            shader.uniforms.uFadeRange = { value: new THREE.Vector2(start, end) };

            this.modificarVertexShader(shader);
            this.modificarFragmentShader(shader);
        };
    }

    private static modificarVertexShader(shader: any): void {
        shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            `
      #include <common>
      uniform vec3 uAvatarPos;
      uniform vec2 uFadeRange;
      varying float vAlpha;
      `
        ).replace(
            '#include <fog_vertex>',
            `
      #include <fog_vertex>
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      float dist = distance(worldPos.xyz, uAvatarPos);
      vAlpha = 1.0 - smoothstep(uFadeRange.x, uFadeRange.y, dist);
      `
        );
    }

    private static modificarFragmentShader(shader: any): void {
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <common>',
            `
      #include <common>
      varying float vAlpha;
      `
        ).replace(
            '#include <dithering_fragment>',
            `
      #include <dithering_fragment>
      gl_FragColor.a *= vAlpha;
      `
        );
    }
}

