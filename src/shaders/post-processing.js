/**
 * post-processing.js — Cesium PostProcessStage pipeline for bloom, sharpen, and LUT
 * OPTIMIZED: 9-tap Gaussian bloom (was 25-sample box blur)
 */
import * as Cesium from 'cesium';
import { getViewer } from '../core/globe.js';

let bloomStage = null;
let sharpenStage = null;

// === BLOOM GLSL — 9-tap Gaussian (was 25 reads, now 9) ===
const BLOOM_FRAG = `
  uniform sampler2D colorTexture;
  uniform float bloomIntensity;
  uniform float bloomThreshold;
  in vec2 v_textureCoordinates;

  void main() {
    vec4 color = texture(colorTexture, v_textureCoordinates);
    vec2 ts = 1.0 / vec2(textureSize(colorTexture, 0)) * 2.0;

    // 9-tap Gaussian: center + 4 axis + 4 diagonal (weighted)
    vec4 blur = color * 0.25;
    blur += texture(colorTexture, v_textureCoordinates + vec2( ts.x, 0.0)) * 0.125;
    blur += texture(colorTexture, v_textureCoordinates + vec2(-ts.x, 0.0)) * 0.125;
    blur += texture(colorTexture, v_textureCoordinates + vec2(0.0,  ts.y)) * 0.125;
    blur += texture(colorTexture, v_textureCoordinates + vec2(0.0, -ts.y)) * 0.125;
    blur += texture(colorTexture, v_textureCoordinates + vec2( ts.x,  ts.y)) * 0.0625;
    blur += texture(colorTexture, v_textureCoordinates + vec2(-ts.x,  ts.y)) * 0.0625;
    blur += texture(colorTexture, v_textureCoordinates + vec2( ts.x, -ts.y)) * 0.0625;
    blur += texture(colorTexture, v_textureCoordinates + vec2(-ts.x, -ts.y)) * 0.0625;

    // Extract bright pixels only
    float brightness = dot(blur.rgb, vec3(0.2126, 0.7152, 0.0722));
    vec4 bloom = brightness > bloomThreshold ? blur : vec4(0.0);

    out_FragColor = color + bloom * bloomIntensity;
  }
`;

// === SHARPEN GLSL ===
const SHARPEN_FRAG = `
  uniform sampler2D colorTexture;
  uniform float sharpenAmount;
  in vec2 v_textureCoordinates;

  void main() {
    vec2 texelSize = 1.0 / vec2(textureSize(colorTexture, 0));
    
    vec4 center = texture(colorTexture, v_textureCoordinates);
    vec4 top = texture(colorTexture, v_textureCoordinates + vec2(0.0, texelSize.y));
    vec4 bottom = texture(colorTexture, v_textureCoordinates - vec2(0.0, texelSize.y));
    vec4 left = texture(colorTexture, v_textureCoordinates - vec2(texelSize.x, 0.0));
    vec4 right = texture(colorTexture, v_textureCoordinates + vec2(texelSize.x, 0.0));
    
    vec4 sharpened = center * (1.0 + 4.0 * sharpenAmount) - (top + bottom + left + right) * sharpenAmount;
    
    out_FragColor = clamp(sharpened, 0.0, 1.0);
  }
`;

/**
 * Initialize post-processing stages
 */
export function initPostProcessing() {
  const viewer = getViewer();
  if (!viewer) return;

  // Bloom stage
  bloomStage = new Cesium.PostProcessStage({
    fragmentShader: BLOOM_FRAG,
    uniforms: {
      bloomIntensity: 0.15,
      bloomThreshold: 0.7
    }
  });
  viewer.scene.postProcessStages.add(bloomStage);

  // Sharpen stage
  sharpenStage = new Cesium.PostProcessStage({
    fragmentShader: SHARPEN_FRAG,
    uniforms: {
      sharpenAmount: 0.0
    }
  });
  viewer.scene.postProcessStages.add(sharpenStage);
}

/**
 * Update bloom intensity (0-1)
 */
export function setBloomIntensity(value) {
  if (bloomStage) {
    bloomStage.uniforms.bloomIntensity = value;
  }
}

/**
 * Update sharpen amount (0-1)
 */
export function setSharpenIntensity(value) {
  if (sharpenStage) {
    sharpenStage.uniforms.sharpenAmount = value;
  }
}
