/**
 * modes.js — CRT, Night Vision (NVG), and Thermal (FLIR) visual modes
 */
import * as Cesium from 'cesium';
import { getViewer } from '../core/globe.js';

let activeMode = 'normal';
let modeStage = null;

// === NIGHT VISION (NVG) GLSL ===
const NVG_FRAG = `
  uniform sampler2D colorTexture;
  uniform float sensitivity;
  uniform float noiseAmount;
  uniform float vignetteStrength;
  uniform float time;
  in vec2 v_textureCoordinates;

  float random(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec4 color = texture(colorTexture, v_textureCoordinates);
    
    // Convert to luminance
    float lum = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
    
    // Amplify with sensitivity
    lum = pow(lum, 1.0 / (1.0 + sensitivity * 2.0));
    
    // Green phosphor color
    vec3 nvgColor = vec3(lum * 0.1, lum * 1.0, lum * 0.15);
    
    // Add noise grain
    float noise = random(v_textureCoordinates + vec2(time * 0.001)) * noiseAmount;
    nvgColor += vec3(noise * 0.1, noise * 0.15, noise * 0.05);
    
    // Tube vignette
    vec2 center = v_textureCoordinates - 0.5;
    float dist = length(center);
    float vignette = 1.0 - smoothstep(0.3, 0.7, dist) * vignetteStrength;
    nvgColor *= vignette;
    
    // Scan line effect
    float scanline = sin(v_textureCoordinates.y * 800.0) * 0.04 + 1.0;
    nvgColor *= scanline;
    
    out_FragColor = vec4(nvgColor, 1.0);
  }
`;

// === THERMAL / FLIR GLSL ===
const FLIR_FRAG = `
  uniform sampler2D colorTexture;
  uniform float sensitivity;
  uniform float heatShimmer;
  uniform float time;
  in vec2 v_textureCoordinates;

  vec3 heatmap(float t) {
    // Thermal color palette: black → blue → purple → red → orange → yellow → white
    vec3 c;
    if (t < 0.15) c = mix(vec3(0.0), vec3(0.0, 0.0, 0.3), t / 0.15);
    else if (t < 0.3) c = mix(vec3(0.0, 0.0, 0.3), vec3(0.4, 0.0, 0.6), (t - 0.15) / 0.15);
    else if (t < 0.5) c = mix(vec3(0.4, 0.0, 0.6), vec3(0.8, 0.0, 0.2), (t - 0.3) / 0.2);
    else if (t < 0.7) c = mix(vec3(0.8, 0.0, 0.2), vec3(1.0, 0.5, 0.0), (t - 0.5) / 0.2);
    else if (t < 0.85) c = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 1.0, 0.0), (t - 0.7) / 0.15);
    else c = mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 1.0, 1.0), (t - 0.85) / 0.15);
    return c;
  }

  void main() {
    // Heat shimmer distortion
    vec2 uv = v_textureCoordinates;
    uv.x += sin(uv.y * 40.0 + time * 0.002) * heatShimmer * 0.002;
    uv.y += cos(uv.x * 30.0 + time * 0.003) * heatShimmer * 0.001;
    
    vec4 color = texture(colorTexture, uv);
    
    // Calculate thermal intensity from brightness
    float thermal = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
    thermal = pow(thermal, 1.0 / (1.0 + sensitivity));
    thermal = clamp(thermal, 0.0, 1.0);
    
    vec3 thermalColor = heatmap(thermal);
    
    out_FragColor = vec4(thermalColor, 1.0);
  }
`;

// === CRT GLSL ===
const CRT_FRAG = `
  uniform sampler2D colorTexture;
  uniform float scanlineIntensity;
  uniform float curvature;
  uniform float chromaticAberration;
  uniform float pixelation;
  uniform float time;
  in vec2 v_textureCoordinates;

  vec2 curveUV(vec2 uv) {
    uv = uv * 2.0 - 1.0;
    vec2 offset = abs(uv.yx) / vec2(curvature);
    uv = uv + uv * offset * offset;
    uv = uv * 0.5 + 0.5;
    return uv;
  }

  void main() {
    vec2 uv = v_textureCoordinates;
    
    // Pixelation
    if (pixelation > 0.0) {
      float pixels = mix(1024.0, 128.0, pixelation);
      uv = floor(uv * pixels) / pixels;
    }
    
    // Barrel distortion
    vec2 curvedUV = curveUV(uv);
    
    // Check bounds
    if (curvedUV.x < 0.0 || curvedUV.x > 1.0 || curvedUV.y < 0.0 || curvedUV.y > 1.0) {
      out_FragColor = vec4(0.0);
      return;
    }
    
    // Chromatic aberration
    float r = texture(colorTexture, curvedUV + vec2(chromaticAberration * 0.002, 0.0)).r;
    float g = texture(colorTexture, curvedUV).g;
    float b = texture(colorTexture, curvedUV - vec2(chromaticAberration * 0.002, 0.0)).b;
    
    vec3 color = vec3(r, g, b);
    
    // Scanlines
    float scanline = sin(curvedUV.y * 600.0 + time * 0.01) * 0.5 + 0.5;
    scanline = pow(scanline, 1.5) * scanlineIntensity + (1.0 - scanlineIntensity);
    color *= scanline;
    
    // Phosphor glow
    color *= 1.0 + 0.05 * sin(time * 0.005);
    
    // Vignette
    vec2 vig = curvedUV - 0.5;
    float vigAmount = 1.0 - dot(vig, vig) * 1.3;
    color *= vigAmount;
    
    // Slight green/amber tint
    color *= vec3(0.95, 1.05, 0.9);
    
    out_FragColor = vec4(color, 1.0);
  }
`;

/**
 * Apply a visual mode
 */
export function setVisualMode(mode, params = {}) {
  const viewer = getViewer();
  if (!viewer) return;

  // Remove existing mode stage
  if (modeStage) {
    viewer.scene.postProcessStages.remove(modeStage);
    modeStage = null;
  }

  activeMode = mode;

  if (mode === 'normal') return;

  const time = { value: 0 };

  // Animate time uniform
  const startTime = performance.now();
  const updateTime = () => {
    time.value = performance.now() - startTime;
    if (modeStage) requestAnimationFrame(updateTime);
  };

  switch (mode) {
    case 'nvg':
      modeStage = new Cesium.PostProcessStage({
        fragmentShader: NVG_FRAG,
        uniforms: {
          sensitivity: params.sensitivity ?? 0.5,
          noiseAmount: params.noise ?? 0.3,
          vignetteStrength: params.vignette ?? 0.8,
          time: function() { return performance.now(); }
        }
      });
      break;

    case 'flir':
      modeStage = new Cesium.PostProcessStage({
        fragmentShader: FLIR_FRAG,
        uniforms: {
          sensitivity: params.sensitivity ?? 0.5,
          heatShimmer: params.shimmer ?? 0.3,
          time: function() { return performance.now(); }
        }
      });
      break;

    case 'crt':
      modeStage = new Cesium.PostProcessStage({
        fragmentShader: CRT_FRAG,
        uniforms: {
          scanlineIntensity: params.scanlines ?? 0.4,
          curvature: params.curvature ?? 6.0,
          chromaticAberration: params.chromatic ?? 0.5,
          pixelation: params.pixelation ?? 0.0,
          time: function() { return performance.now(); }
        }
      });
      break;
  }

  if (modeStage) {
    viewer.scene.postProcessStages.add(modeStage);
  }
}

/**
 * Update mode parameters
 */
export function updateModeParam(key, value) {
  if (modeStage && modeStage.uniforms[key] !== undefined) {
    modeStage.uniforms[key] = value;
  }
}

/**
 * Get current mode
 */
export function getActiveMode() {
  return activeMode;
}
