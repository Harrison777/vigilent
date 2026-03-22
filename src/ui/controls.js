/**
 * controls.js — Shader mode buttons + slider wiring
 */
import { setVisualMode, updateModeParam } from '../shaders/modes.js';
import { setBloomIntensity, setSharpenIntensity } from '../shaders/post-processing.js';

export function initControls() {
  // Mode buttons
  document.querySelectorAll('.shader-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.shader-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.dataset.mode;
      setVisualMode(mode);

      // Show/hide mode-specific sliders
      const sensitivityRow = document.getElementById('sensitivityRow');
      const pixelationRow = document.getElementById('pixelationRow');

      if (mode === 'normal') {
        sensitivityRow?.classList.add('hidden');
        pixelationRow?.classList.add('hidden');
      } else {
        sensitivityRow?.classList.remove('hidden');
        if (mode === 'crt') {
          pixelationRow?.classList.remove('hidden');
        } else {
          pixelationRow?.classList.add('hidden');
        }
      }
    });
  });

  // Bloom slider
  const bloomSlider = document.getElementById('bloomIntensity');
  const bloomVal = document.getElementById('bloomVal');
  if (bloomSlider) {
    bloomSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      bloomVal.textContent = val;
      setBloomIntensity(val / 100);
    });
  }

  // Sharpen slider
  const sharpenSlider = document.getElementById('sharpenIntensity');
  const sharpenVal = document.getElementById('sharpenVal');
  if (sharpenSlider) {
    sharpenSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      sharpenVal.textContent = val;
      setSharpenIntensity(val / 100);
    });
  }

  // Sensitivity slider (NVG/FLIR/CRT)
  const sensitivitySlider = document.getElementById('sensitivity');
  const sensitivityVal = document.getElementById('sensitivityVal');
  if (sensitivitySlider) {
    sensitivitySlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      sensitivityVal.textContent = val;
      updateModeParam('sensitivity', val / 100);
    });
  }

  // Pixelation slider (CRT only)
  const pixelationSlider = document.getElementById('pixelation');
  const pixelationVal = document.getElementById('pixelationVal');
  if (pixelationSlider) {
    pixelationSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      pixelationVal.textContent = val;
      updateModeParam('pixelation', val / 100);
    });
  }
}
