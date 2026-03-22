/**
 * search.js — Location search with Nominatim autocomplete + fly-to
 */
import { searchLocations, flyToLocation } from '../core/camera.js';
import { isAgentMode } from './agent.js';

let debounceTimer = null;

export function initSearch() {
  const input = document.getElementById('searchInput');
  const dropdown = document.getElementById('searchResults');
  if (!input || !dropdown) return;

  input.addEventListener('input', (e) => {
    if (isAgentMode()) return; // Agent mode handles its own input
    const query = e.target.value.trim();
    clearTimeout(debounceTimer);

    if (query.length < 3) {
      dropdown.classList.remove('visible');
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const results = await searchLocations(query);
        renderResults(results, dropdown);
      } catch (err) {
        console.warn('[SEARCH] Error:', err);
      }
    }, 400);
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#searchContainer')) {
      dropdown.classList.remove('visible');
    }
  });

  // Enter key = search & fly to first result
  input.addEventListener('keydown', async (e) => {
    if (isAgentMode()) return; // Agent mode handles Enter key
    if (e.key === 'Enter') {
      const query = input.value.trim();
      if (!query) return;
      const results = await searchLocations(query);
      if (results.length > 0) {
        flyToLocation(results[0]);
        dropdown.classList.remove('visible');
      }
    }
  });
}

function renderResults(results, dropdown) {
  if (results.length === 0) {
    dropdown.classList.remove('visible');
    return;
  }

  dropdown.innerHTML = results.map(r => `
    <div class="search-result-item" data-lat="${r.lat}" data-lon="${r.lon}" data-osm-type="${r.osmType || ''}" data-osm-id="${r.osmId || ''}">
      <div>${r.displayName.substring(0, 80)}</div>
      <div class="result-type">${r.type || 'place'}</div>
    </div>
  `).join('');

  dropdown.classList.add('visible');

  // Click handler
  dropdown.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const location = {
        lat: parseFloat(item.dataset.lat),
        lon: parseFloat(item.dataset.lon),
        osmType: item.dataset.osmType,
        osmId: item.dataset.osmId,
        displayName: item.textContent,
        boundingbox: null
      };
      flyToLocation(location);
      dropdown.classList.remove('visible');
      document.getElementById('searchInput').value = item.querySelector('div').textContent;
    });
  });
}
