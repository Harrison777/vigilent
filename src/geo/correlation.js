/**
 * correlation.js — Strike ↔ Satellite overhead correlation engine
 */
import * as Cesium from 'cesium';
import * as satellite from 'satellite.js';
import { getViewer } from '../core/globe.js';
import { SATELLITE_CATEGORIES } from '../data/satellite-db.js';

/**
 * Find satellites that were overhead during a ground event
 * @param {Object} event - { lat, lon, timestamp }
 * @param {Map} tleCache - Map of NORAD ID → TLE data
 * @param {number} windowMinutes - Time window (±) in minutes
 * @returns {Array} List of correlations
 */
export function findOverheadSatellites(event, tleCache, windowMinutes = 30) {
  const correlations = [];
  const eventTime = new Date(event.timestamp);
  const eventLat = event.lat;
  const eventLon = event.lon;

  // Check only reconnaissance/imaging satellites
  const isrSatellites = SATELLITE_CATEGORIES.military.satellites.filter(
    s => ['Recon', 'EO/Recon', 'SAR', 'EO'].includes(s.type)
  );

  isrSatellites.forEach(satInfo => {
    const tle = tleCache.get(satInfo.noradId);
    if (!tle) return;

    // Check positions within ± windowMinutes
    for (let offsetMin = -windowMinutes; offsetMin <= windowMinutes; offsetMin += 2) {
      const checkTime = new Date(eventTime.getTime() + offsetMin * 60000);

      try {
        const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
        const posVel = satellite.propagate(satrec, checkTime);
        if (!posVel.position) continue;

        const gmst = satellite.gstime(checkTime);
        const posGd = satellite.eciToGeodetic(posVel.position, gmst);
        const satLat = satellite.degreesLat(posGd.latitude);
        const satLon = satellite.degreesLong(posGd.longitude);
        const satAlt = posGd.height; // km

        // Calculate ground distance
        const dLat = Math.abs(satLat - eventLat);
        const dLon = Math.abs(satLon - eventLon);
        const groundDistDeg = Math.sqrt(dLat * dLat + dLon * dLon);
        const groundDistKm = groundDistDeg * 111;

        // A satellite can see about ±1500km at 500km altitude (simplified view cone)
        const maxViewDistance = satAlt * 2.5; // rough swath radius

        if (groundDistKm < maxViewDistance) {
          // Check if we already have this satellite
          const existing = correlations.find(c => c.noradId === satInfo.noradId);
          if (!existing || groundDistKm < existing.distanceKm) {
            if (existing) {
              // Update with closer pass
              existing.distanceKm = Math.round(groundDistKm);
              existing.passTime = checkTime.toISOString();
              existing.offsetMinutes = offsetMin;
              existing.satPosition = { lat: satLat, lon: satLon, alt: satAlt * 1000 };
            } else {
              correlations.push({
                noradId: satInfo.noradId,
                name: satInfo.name,
                nation: satInfo.nation,
                operator: satInfo.operator,
                sensorType: satInfo.type,
                resolution: satInfo.resolution,
                distanceKm: Math.round(groundDistKm),
                passTime: checkTime.toISOString(),
                offsetMinutes: offsetMin,
                satPosition: { lat: satLat, lon: satLon, alt: satAlt * 1000 }
              });
            }
          }
        }
      } catch (e) {
        // Skip unpropagable satellites
      }
    }
  });

  // Sort by closest pass
  correlations.sort((a, b) => a.distanceKm - b.distanceKm);
  return correlations;
}

/**
 * Draw correlation lines on the globe
 */
export function drawCorrelationLines(event, correlations) {
  const viewer = getViewer();
  if (!viewer) return;

  // Clear existing correlation lines
  viewer.entities.values
    .filter(e => e.id?.startsWith('corr-'))
    .forEach(e => viewer.entities.remove(e));

  correlations.forEach((corr, i) => {
    viewer.entities.add({
      id: `corr-${event.id}-${corr.noradId}`,
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          event.lon, event.lat, 1000,
          corr.satPosition.lon, corr.satPosition.lat, corr.satPosition.alt
        ]),
        width: 2,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.3,
          color: Cesium.Color.fromCssColorString('#ff1744').withAlpha(0.6)
        }),
      }
    });
  });

  // Update correlation panel
  updateCorrelationPanel(event, correlations);
}

function updateCorrelationPanel(event, correlations) {
  const panel = document.getElementById('correlationPanel');
  const body = document.getElementById('correlationBody');
  if (!panel || !body) return;

  if (correlations.length === 0) {
    panel.classList.add('hidden');
    return;
  }

  panel.classList.remove('hidden');

  body.innerHTML = `
    <div style="margin-bottom: 8px; color: #9aa0a6; font-size: 10px;">
      EVENT: ${event.title}<br>
      TIME: ${new Date(event.timestamp).toUTCString()}
    </div>
    ${correlations.map(c => `
      <div class="correlation-item">
        <span class="sat-name">${c.name}</span> (${c.nation})
        <br><span class="pass-time">
          ${c.sensorType} | ${c.resolution} | 
          ${c.offsetMinutes > 0 ? '+' : ''}${c.offsetMinutes}min | 
          ${c.distanceKm}km groundtrack
        </span>
      </div>
    `).join('')}
  `;
}
