/**
 * sidebar.js — Sidebar toggle + layer toggle wiring
 */
import { toggleLayer } from '../core/layers.js';

export function initSidebar() {
  // Sidebar toggle
  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Layer toggles — wire up all data-layer checkboxes
  document.querySelectorAll('[data-layer]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const layerId = e.target.dataset.layer;
      const checked = e.target.checked;
      toggleLayer(layerId, checked);
    });
  });
}
