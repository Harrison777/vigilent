/**
 * icons.js — Canvas-rendered icons for map entities (airplanes, ships)
 * Generates rotatable billboard images at runtime
 */

// Cache generated icons to avoid re-rendering
const iconCache = new Map();

/**
 * Create a canvas-rendered airplane icon
 * @param {string} color - CSS color string
 * @param {number} heading - Heading in degrees (0=north, 90=east)
 * @param {number} size - Icon size in pixels
 * @returns {HTMLCanvasElement}
 */
export function createAirplaneIcon(color, heading = 0, size = 32) {
  const key = `plane-${color}-${Math.round(heading)}-${size}`;
  if (iconCache.has(key)) return iconCache.get(key);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 32;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(cx, cy);
  // Cesium heading: 0=North (up), 90=East — canvas 0=right, so rotate -90
  ctx.rotate(((heading - 90) * Math.PI) / 180);

  // Draw airplane silhouette pointing RIGHT (→) so rotation math works
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 4 * scale;

  ctx.beginPath();
  // Fuselage
  ctx.moveTo(14 * scale, 0);           // nose
  ctx.lineTo(6 * scale, -2 * scale);   // upper fuse
  ctx.lineTo(-8 * scale, -1.5 * scale);
  ctx.lineTo(-12 * scale, -2 * scale);
  // Tail
  ctx.lineTo(-14 * scale, -6 * scale); // tail fin top
  ctx.lineTo(-14 * scale, -2 * scale);
  ctx.lineTo(-12 * scale, -1.5 * scale);
  // Mirror bottom
  ctx.lineTo(-12 * scale, 1.5 * scale);
  ctx.lineTo(-14 * scale, 2 * scale);
  ctx.lineTo(-14 * scale, 6 * scale);  // tail fin bottom
  ctx.lineTo(-12 * scale, 2 * scale);
  ctx.lineTo(-8 * scale, 1.5 * scale);
  ctx.lineTo(6 * scale, 2 * scale);
  ctx.closePath();
  ctx.fill();

  // Wings
  ctx.beginPath();
  ctx.moveTo(2 * scale, -2 * scale);
  ctx.lineTo(-2 * scale, -12 * scale);  // left wingtip
  ctx.lineTo(-5 * scale, -12 * scale);
  ctx.lineTo(-4 * scale, -2 * scale);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(2 * scale, 2 * scale);
  ctx.lineTo(-2 * scale, 12 * scale);   // right wingtip
  ctx.lineTo(-5 * scale, 12 * scale);
  ctx.lineTo(-4 * scale, 2 * scale);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  iconCache.set(key, canvas);
  return canvas;
}

/**
 * Create a canvas-rendered ship icon
 * @param {string} color - CSS color string
 * @param {number} heading - Heading in degrees (0=north, 90=east)
 * @param {number} size - Icon size in pixels
 * @param {string} vesselType - Type of vessel for shape variation
 * @returns {HTMLCanvasElement}
 */
export function createShipIcon(color, heading = 0, size = 28, vesselType = 'cargo') {
  const key = `ship-${color}-${Math.round(heading)}-${size}-${vesselType}`;
  if (iconCache.has(key)) return iconCache.get(key);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 28;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(((heading - 90) * Math.PI) / 180);

  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 3 * scale;

  if (vesselType === 'military') {
    // Military vessel — sleek wedge shape
    ctx.beginPath();
    ctx.moveTo(13 * scale, 0);            // bow
    ctx.lineTo(4 * scale, -5 * scale);
    ctx.lineTo(-8 * scale, -5 * scale);
    ctx.lineTo(-12 * scale, -3 * scale);  // stern
    ctx.lineTo(-12 * scale, 3 * scale);
    ctx.lineTo(-8 * scale, 5 * scale);
    ctx.lineTo(4 * scale, 5 * scale);
    ctx.closePath();
    ctx.fill();

    // Superstructure
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(-4 * scale, -2.5 * scale, 6 * scale, 5 * scale);
    ctx.globalAlpha = 1.0;
  } else if (vesselType === 'tanker') {
    // Tanker — wide body
    ctx.beginPath();
    ctx.moveTo(12 * scale, 0);
    ctx.lineTo(6 * scale, -6 * scale);
    ctx.lineTo(-10 * scale, -6 * scale);
    ctx.lineTo(-12 * scale, -4 * scale);
    ctx.lineTo(-12 * scale, 4 * scale);
    ctx.lineTo(-10 * scale, 6 * scale);
    ctx.lineTo(6 * scale, 6 * scale);
    ctx.closePath();
    ctx.fill();

    // Tanks on deck
    ctx.globalAlpha = 0.35;
    for (let i = -6; i <= 4; i += 4) {
      ctx.beginPath();
      ctx.arc(i * scale, 0, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  } else if (vesselType === 'passenger') {
    // Cruise ship — long body with rounded bow
    ctx.beginPath();
    ctx.moveTo(12 * scale, 0);
    ctx.quadraticCurveTo(12 * scale, -4 * scale, 6 * scale, -4.5 * scale);
    ctx.lineTo(-9 * scale, -4.5 * scale);
    ctx.lineTo(-11 * scale, -3 * scale);
    ctx.lineTo(-11 * scale, 3 * scale);
    ctx.lineTo(-9 * scale, 4.5 * scale);
    ctx.lineTo(6 * scale, 4.5 * scale);
    ctx.quadraticCurveTo(12 * scale, 4 * scale, 12 * scale, 0);
    ctx.closePath();
    ctx.fill();

    // Decks
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 0.5 * scale;
    for (let y = -2; y <= 2; y += 2) {
      ctx.beginPath();
      ctx.moveTo(-7 * scale, y * scale);
      ctx.lineTo(8 * scale, y * scale);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
  } else {
    // Cargo / default — classic freighter
    ctx.beginPath();
    ctx.moveTo(12 * scale, 0);             // bow point
    ctx.lineTo(5 * scale, -5 * scale);
    ctx.lineTo(-9 * scale, -5 * scale);
    ctx.lineTo(-11 * scale, -3 * scale);   // stern
    ctx.lineTo(-11 * scale, 3 * scale);
    ctx.lineTo(-9 * scale, 5 * scale);
    ctx.lineTo(5 * scale, 5 * scale);
    ctx.closePath();
    ctx.fill();

    // Containers on deck
    ctx.globalAlpha = 0.35;
    ctx.fillRect(-7 * scale, -3 * scale, 10 * scale, 6 * scale);
    ctx.globalAlpha = 1.0;
  }

  ctx.restore();

  iconCache.set(key, canvas);
  return canvas;
}

/**
 * Clear the icon cache (call on layer destroy)
 */
export function clearIconCache() {
  iconCache.clear();
}

/**
 * Create a canvas-rendered event icon for geopolitical events
 * Each type gets a unique tactical symbol
 * @param {string} type - Event type: strike, response, diplomatic, sanction, military_movement
 * @param {string} color - CSS color string
 * @param {number} size - Icon size in pixels
 * @returns {HTMLCanvasElement}
 */
export function createEventIcon(type, color, size = 40) {
  const key = `event-${type}-${color}-${size}`;
  if (iconCache.has(key)) return iconCache.get(key);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  const s = size / 40; // scale factor

  ctx.clearRect(0, 0, size, size);

  // Set glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 6 * s;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5 * s;

  switch (type) {
    case 'strike':
      // EXPLOSION BURST — jagged starburst with inner fireball
      ctx.beginPath();
      const spikes = 10;
      const outerR = 16 * s;
      const innerR = 8 * s;
      for (let i = 0; i < spikes * 2; i++) {
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.globalAlpha = 0.85;
      ctx.fill();

      // Inner fireball
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.6;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 7 * s);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#ffab00');
      grad.addColorStop(1, color);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 7 * s, 0, Math.PI * 2);
      ctx.fill();

      // Shrapnel rays
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1 * s;
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 + Math.PI / 6;
        ctx.beginPath();
        ctx.moveTo(cx + 12 * s * Math.cos(angle), cy + 12 * s * Math.sin(angle));
        ctx.lineTo(cx + 18 * s * Math.cos(angle), cy + 18 * s * Math.sin(angle));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      break;

    case 'response':
      // CROSSHAIR RETICLE — targeting scope
      ctx.globalAlpha = 0.85;
      // Outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, 13 * s, 0, Math.PI * 2);
      ctx.stroke();

      // Inner ring
      ctx.beginPath();
      ctx.arc(cx, cy, 6 * s, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshair lines with gaps
      ctx.lineWidth = 2 * s;
      // Top
      ctx.beginPath();
      ctx.moveTo(cx, cy - 18 * s);
      ctx.lineTo(cx, cy - 8 * s);
      ctx.stroke();
      // Bottom
      ctx.beginPath();
      ctx.moveTo(cx, cy + 8 * s);
      ctx.lineTo(cx, cy + 18 * s);
      ctx.stroke();
      // Left
      ctx.beginPath();
      ctx.moveTo(cx - 18 * s, cy);
      ctx.lineTo(cx - 8 * s, cy);
      ctx.stroke();
      // Right
      ctx.beginPath();
      ctx.moveTo(cx + 8 * s, cy);
      ctx.lineTo(cx + 18 * s, cy);
      ctx.stroke();

      // Center dot
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx, cy, 2 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;

    case 'diplomatic':
      // DOVE / OLIVE BRANCH — peace symbol
      ctx.globalAlpha = 0.85;
      // Circle outline
      ctx.beginPath();
      ctx.arc(cx, cy, 14 * s, 0, Math.PI * 2);
      ctx.lineWidth = 1.5 * s;
      ctx.stroke();

      // Handshake shape — two hands meeting
      ctx.lineWidth = 2 * s;
      ctx.lineCap = 'round';
      // Left hand
      ctx.beginPath();
      ctx.moveTo(cx - 10 * s, cy + 2 * s);
      ctx.quadraticCurveTo(cx - 4 * s, cy - 6 * s, cx, cy);
      ctx.stroke();
      // Right hand
      ctx.beginPath();
      ctx.moveTo(cx + 10 * s, cy + 2 * s);
      ctx.quadraticCurveTo(cx + 4 * s, cy - 6 * s, cx, cy);
      ctx.stroke();
      // Star above
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? 4 * s : 2 * s;
        const x = cx + r * Math.cos(angle);
        const y = (cy - 8 * s) + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      break;

    case 'sanction':
      // BAN SYMBOL — circle with diagonal slash (⚖ prohibition)
      ctx.globalAlpha = 0.85;
      // Outer circle
      ctx.lineWidth = 2.5 * s;
      ctx.beginPath();
      ctx.arc(cx, cy, 14 * s, 0, Math.PI * 2);
      ctx.stroke();

      // Diagonal slash
      ctx.lineWidth = 2.5 * s;
      ctx.beginPath();
      ctx.moveTo(cx - 10 * s, cy - 10 * s);
      ctx.lineTo(cx + 10 * s, cy + 10 * s);
      ctx.stroke();

      // Dollar sign in center
      ctx.font = `bold ${12 * s}px JetBrains Mono`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.5;
      ctx.fillText('$', cx, cy + 1 * s);
      ctx.globalAlpha = 1;
      break;

    case 'military_movement':
      // CHEVRON ARROWS — tactical movement indicator
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 2.5 * s;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Double chevron pointing up
      // First chevron
      ctx.beginPath();
      ctx.moveTo(cx - 10 * s, cy + 2 * s);
      ctx.lineTo(cx, cy - 8 * s);
      ctx.lineTo(cx + 10 * s, cy + 2 * s);
      ctx.stroke();
      // Second chevron
      ctx.beginPath();
      ctx.moveTo(cx - 10 * s, cy + 10 * s);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + 10 * s, cy + 10 * s);
      ctx.stroke();

      // Small diamond at top
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 14 * s);
      ctx.lineTo(cx + 4 * s, cy - 10 * s);
      ctx.lineTo(cx, cy - 6 * s);
      ctx.lineTo(cx - 4 * s, cy - 10 * s);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      break;

    default:
      // Fallback — simple filled circle
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(cx, cy, 10 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
  }

  iconCache.set(key, canvas);
  return canvas;
}
