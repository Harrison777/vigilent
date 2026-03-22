/**
 * camera.js — Jump-to-location with OSM 3D volume calculation
 */
import * as Cesium from 'cesium';
import { getViewer } from './globe.js';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Search for locations using Nominatim geocoding
 */
export async function searchLocations(query) {
  const res = await fetch(
    `${NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1`,
    { headers: { 'User-Agent': 'WorldTracker/1.0' } }
  );
  const data = await res.json();
  return data.map(r => ({
    displayName: r.display_name,
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    type: r.type,
    osmType: r.osm_type,
    osmId: r.osm_id,
    boundingbox: r.boundingbox?.map(Number)
  }));
}

/**
 * Calculate 3D bounding volume from OSM data for better camera framing.
 * Queries Overpass for the POI's geometry and height to center camera on the 3D volume.
 */
async function calculateOSMVolume(location) {
  const { osmType, osmId, lat, lon, boundingbox } = location;

  // Default camera parameters
  let height = 500;
  let range = 2000;
  let heading = 0;
  let pitch = -35;

  if (!osmType || !osmId) {
    return { lat, lon, height: height / 2, range, heading, pitch };
  }

  try {
    // Query Overpass for building height/levels
    const typeMap = { node: 'node', way: 'way', relation: 'relation' };
    const osmT = typeMap[osmType] || 'way';
    const query = `[out:json][timeout:5];${osmT}(${osmId});out body;`;
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`
    });
    const data = await res.json();

    if (data.elements && data.elements.length > 0) {
      const el = data.elements[0];
      const tags = el.tags || {};

      // Extract height from OSM tags
      if (tags.height) {
        height = parseFloat(tags.height) || height;
      } else if (tags['building:levels']) {
        height = (parseInt(tags['building:levels']) || 1) * 3.5;
      } else if (tags.building) {
        height = 30; // Default building height
      }

      // Calculate range based on feature size
      if (boundingbox && boundingbox.length === 4) {
        const latSpan = Math.abs(boundingbox[1] - boundingbox[0]);
        const lonSpan = Math.abs(boundingbox[3] - boundingbox[2]);
        const maxSpan = Math.max(latSpan, lonSpan);
        range = Math.max(maxSpan * 111000 * 2.5, 500); // deg to meters, with padding
      } else {
        range = Math.max(height * 6, 500);
      }
    }
  } catch (e) {
    console.warn('[CAMERA] Overpass query failed, using defaults:', e.message);
  }

  return {
    lat,
    lon,
    height: height / 2, // Center on middle of the structure
    range: Math.min(range, 50000), // Cap range
    heading,
    pitch
  };
}

/**
 * Fly to a location with OSM volume-aware camera framing
 */
export async function flyToLocation(location) {
  const viewer = getViewer();
  if (!viewer) return;

  const volume = await calculateOSMVolume(location);

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(volume.lon, volume.lat, volume.height + volume.range * 0.3),
    orientation: {
      heading: Cesium.Math.toRadians(volume.heading),
      pitch: Cesium.Math.toRadians(volume.pitch),
      roll: 0
    },
    duration: 1.2,
    easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT
  });
}

/**
 * Quick fly to coordinates
 */
export function flyToCoords(lon, lat, alt = 5000000) {
  const viewer = getViewer();
  if (!viewer) return;

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, alt),
    duration: 0.8,
    easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT
  });
}
