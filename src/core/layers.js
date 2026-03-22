/**
 * layers.js — Layer registry for toggling data layers
 */

const layers = new Map();

/**
 * Register a data layer
 */
export function registerLayer(id, { name, init, show, hide, update, destroy }) {
  layers.set(id, {
    name,
    init: init || (() => {}),
    show: show || (() => {}),
    hide: hide || (() => {}),
    update: update || (() => {}),
    destroy: destroy || (() => {}),
    visible: false,
    initialized: false
  });
}

/**
 * Toggle layer visibility
 */
export async function toggleLayer(id, visible) {
  const layer = layers.get(id);
  if (!layer) {
    console.warn(`[LAYERS] Unknown layer "${id}"`);
    return;
  }

  if (visible && !layer.initialized) {
    try {
      console.log(`[LAYERS] Initializing "${id}"...`);
      await layer.init();
      layer.initialized = true;
      console.log(`[LAYERS] ✓ "${id}" initialized`);
    } catch (e) {
      console.error(`[LAYERS] Failed to init layer "${id}":`, e);
      return;
    }
  }

  if (visible) {
    layer.show();
    layer.visible = true;
  } else {
    layer.hide();
    layer.visible = false;
  }

  updateCounter();
}

/**
 * Update all visible layers (called each frame or on timer)
 */
export function updateActiveLayers(dt) {
  layers.forEach((layer) => {
    if (layer.visible && layer.initialized) {
      layer.update(dt);
    }
  });
}

/**
 * Get active layer count — computed from actual state
 */
export function getActiveCount() {
  let count = 0;
  layers.forEach(l => { if (l.visible) count++; });
  return count;
}

function updateCounter() {
  const el = document.getElementById('activeLayerCount');
  if (el) el.textContent = getActiveCount();
}

/**
 * Check if a layer is visible
 */
export function isLayerVisible(id) {
  const layer = layers.get(id);
  return layer ? layer.visible : false;
}

/**
 * Get all currently visible layer IDs (for save/restore)
 */
export function getVisibleLayerIds() {
  const ids = [];
  layers.forEach((layer, id) => { if (layer.visible) ids.push(id); });
  return ids;
}
