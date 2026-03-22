/**
 * satellite-db.js — NORAD catalog of notable commercial & military satellites
 */

export const SATELLITE_CATEGORIES = {
  commercial: {
    label: 'Commercial / Civilian',
    color: '#00e5ff',
    satellites: [
      // Maxar/DigitalGlobe constellation
      { name: 'WorldView-1', noradId: 32060, nation: 'USA', operator: 'Maxar', type: 'EO', resolution: '0.5m', orbit: 'SSO' },
      { name: 'WorldView-2', noradId: 35946, nation: 'USA', operator: 'Maxar', type: 'EO', resolution: '0.46m', orbit: 'SSO' },
      { name: 'WorldView-3', noradId: 40115, nation: 'USA', operator: 'Maxar', type: 'EO', resolution: '0.31m', orbit: 'SSO' },
      { name: 'GeoEye-1', noradId: 33331, nation: 'USA', operator: 'Maxar', type: 'EO', resolution: '0.41m', orbit: 'SSO' },
      // Planet Labs
      { name: 'PlanetScope (sample)', noradId: 44072, nation: 'USA', operator: 'Planet', type: 'EO', resolution: '3m', orbit: 'SSO' },
      // ISS
      { name: 'ISS (ZARYA)', noradId: 25544, nation: 'INT', operator: 'NASA/Roscosmos', type: 'Station', resolution: 'N/A', orbit: 'LEO' },
      // Hubble
      { name: 'Hubble Space Telescope', noradId: 20580, nation: 'USA', operator: 'NASA', type: 'Telescope', resolution: 'N/A', orbit: 'LEO' },
      // Starlink samples
      { name: 'Starlink-1007', noradId: 44713, nation: 'USA', operator: 'SpaceX', type: 'Comms', resolution: 'N/A', orbit: 'LEO' },
      { name: 'Starlink-1022', noradId: 44725, nation: 'USA', operator: 'SpaceX', type: 'Comms', resolution: 'N/A', orbit: 'LEO' },
      // Sentinel (EU)
      { name: 'Sentinel-2A', noradId: 40697, nation: 'EU', operator: 'ESA', type: 'EO', resolution: '10m', orbit: 'SSO' },
      { name: 'Sentinel-2B', noradId: 42063, nation: 'EU', operator: 'ESA', type: 'EO', resolution: '10m', orbit: 'SSO' },
      // Landsat
      { name: 'Landsat 9', noradId: 49260, nation: 'USA', operator: 'USGS/NASA', type: 'EO', resolution: '15m', orbit: 'SSO' },
      // GOES weather
      { name: 'GOES-16', noradId: 41866, nation: 'USA', operator: 'NOAA', type: 'Weather', resolution: '0.5km', orbit: 'GEO' },
      { name: 'GOES-18', noradId: 51850, nation: 'USA', operator: 'NOAA', type: 'Weather', resolution: '0.5km', orbit: 'GEO' },
    ]
  },
  military: {
    label: 'Military / ISR',
    color: '#ff1744',
    satellites: [
      // Russian recon
      { name: 'Persona 3 (Kosmos-2506)', noradId: 40258, nation: 'RUS', operator: 'MoD Russia', type: 'Recon', resolution: '0.3m est', orbit: 'SSO' },
      { name: 'Bars-M No.1 (Kosmos-2503)', noradId: 40420, nation: 'RUS', operator: 'MoD Russia', type: 'EO/Recon', resolution: '1m est', orbit: 'SSO' },
      // Chinese recon
      { name: 'Gaofen-1', noradId: 39150, nation: 'CHN', operator: 'CNSA', type: 'EO/Recon', resolution: '2m', orbit: 'SSO' },
      { name: 'Gaofen-2', noradId: 40118, nation: 'CHN', operator: 'CNSA', type: 'EO/Recon', resolution: '0.8m', orbit: 'SSO' },
      { name: 'Gaofen-11', noradId: 43585, nation: 'CHN', operator: 'PLA', type: 'Recon', resolution: '0.1m est', orbit: 'SSO' },
      { name: 'Yaogan-30A', noradId: 42706, nation: 'CHN', operator: 'PLA', type: 'SIGINT', resolution: 'N/A', orbit: 'LEO' },
      { name: 'Yaogan-33', noradId: 46492, nation: 'CHN', operator: 'PLA', type: 'SAR', resolution: '1m est', orbit: 'SSO' },
      // US NRO / military
      { name: 'USA-224 (KH-11)', noradId: 37348, nation: 'USA', operator: 'NRO', type: 'Recon', resolution: '0.1m est', orbit: 'LEO' },
      { name: 'USA-245 (KH-11)', noradId: 39232, nation: 'USA', operator: 'NRO', type: 'Recon', resolution: '0.1m est', orbit: 'LEO' },
      { name: 'USA-314 (KH-11)', noradId: 51440, nation: 'USA', operator: 'NRO', type: 'Recon', resolution: '0.1m est', orbit: 'LEO' },
      { name: 'Topaz (USA-179)', noradId: 28888, nation: 'USA', operator: 'NRO', type: 'SIGINT', resolution: 'N/A', orbit: 'GEO' },
      // SAR satellites
      { name: 'Capella-2', noradId: 46495, nation: 'USA', operator: 'Capella Space', type: 'SAR', resolution: '0.5m', orbit: 'SSO' },
      { name: 'Capella-6', noradId: 51071, nation: 'USA', operator: 'Capella Space', type: 'SAR', resolution: '0.5m', orbit: 'SSO' },
      { name: 'ICEYE-X2', noradId: 43114, nation: 'FIN', operator: 'ICEYE', type: 'SAR', resolution: '1m', orbit: 'SSO' },
      // Israeli
      { name: 'Ofek-16', noradId: 45918, nation: 'ISR', operator: 'IDF', type: 'Recon', resolution: '0.5m est', orbit: 'Retro-SSO' },
      // Indian
      { name: 'RISAT-2BR1', noradId: 44857, nation: 'IND', operator: 'ISRO', type: 'SAR', resolution: '0.35m', orbit: 'LEO' },
    ]
  }
};

/**
 * Get all satellite NORAD IDs for TLE fetching
 */
export function getAllNoradIds() {
  const ids = [];
  Object.values(SATELLITE_CATEGORIES).forEach(cat => {
    cat.satellites.forEach(sat => ids.push(sat.noradId));
  });
  return ids;
}

/**
 * Look up satellite metadata by NORAD ID
 */
export function getSatelliteInfo(noradId) {
  for (const [catKey, cat] of Object.entries(SATELLITE_CATEGORIES)) {
    const sat = cat.satellites.find(s => s.noradId === noradId);
    if (sat) return { ...sat, category: catKey, categoryLabel: cat.label, color: cat.color };
  }
  return null;
}
