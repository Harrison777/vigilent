/**
 * satellite-db.js — NORAD catalog of tracked satellites across 6 categories
 * 160+ satellites: Commercial, Military, Navigation, Weather, Communications, Science
 */

export const SATELLITE_CATEGORIES = {
  commercial: {
    label: 'Commercial / Civilian',
    color: '#00e5ff',
    satellites: [
      // ── Maxar/DigitalGlobe ──
      { name: 'WorldView-1', noradId: 32060, nation: 'USA', operator: 'Maxar', type: 'EO', resolution: '0.5m', orbit: 'SSO' },
      { name: 'WorldView-2', noradId: 35946, nation: 'USA', operator: 'Maxar', type: 'EO', resolution: '0.46m', orbit: 'SSO' },
      { name: 'WorldView-3', noradId: 40115, nation: 'USA', operator: 'Maxar', type: 'EO', resolution: '0.31m', orbit: 'SSO' },
      { name: 'WorldView Legion 1', noradId: 56174, nation: 'USA', operator: 'Maxar', type: 'EO', resolution: '0.29m', orbit: 'SSO' },
      { name: 'GeoEye-1', noradId: 33331, nation: 'USA', operator: 'Maxar', type: 'EO', resolution: '0.41m', orbit: 'SSO' },
      // ── Planet Labs ──
      { name: 'SkySat-1', noradId: 39418, nation: 'USA', operator: 'Planet', type: 'EO', resolution: '0.5m', orbit: 'SSO' },
      { name: 'SkySat-14', noradId: 43797, nation: 'USA', operator: 'Planet', type: 'EO', resolution: '0.5m', orbit: 'SSO' },
      { name: 'Flock-4p 1', noradId: 47439, nation: 'USA', operator: 'Planet', type: 'EO', resolution: '3m', orbit: 'SSO' },
      { name: 'Flock-4s 1', noradId: 49005, nation: 'USA', operator: 'Planet', type: 'EO', resolution: '3m', orbit: 'SSO' },
      { name: 'Pelican-1', noradId: 58432, nation: 'USA', operator: 'Planet', type: 'EO', resolution: '0.3m', orbit: 'SSO' },
      // ── Space Stations ──
      { name: 'ISS (ZARYA)', noradId: 25544, nation: 'INT', operator: 'NASA/Roscosmos', type: 'Station', resolution: 'N/A', orbit: 'LEO' },
      { name: 'Tiangong (CSS)', noradId: 48274, nation: 'CHN', operator: 'CMSA', type: 'Station', resolution: 'N/A', orbit: 'LEO' },
      // ── Telescopes & Science ──
      { name: 'Hubble Space Telescope', noradId: 20580, nation: 'USA', operator: 'NASA', type: 'Telescope', resolution: 'N/A', orbit: 'LEO' },
      { name: 'JWST', noradId: 50463, nation: 'USA', operator: 'NASA/ESA', type: 'Telescope', resolution: 'N/A', orbit: 'L2' },
      // ── Starlink samples ──
      { name: 'Starlink-1007', noradId: 44713, nation: 'USA', operator: 'SpaceX', type: 'Comms', resolution: 'N/A', orbit: 'LEO' },
      { name: 'Starlink-1022', noradId: 44725, nation: 'USA', operator: 'SpaceX', type: 'Comms', resolution: 'N/A', orbit: 'LEO' },
      { name: 'Starlink-2305', noradId: 48601, nation: 'USA', operator: 'SpaceX', type: 'Comms', resolution: 'N/A', orbit: 'LEO' },
      { name: 'Starlink-3001', noradId: 49140, nation: 'USA', operator: 'SpaceX', type: 'Comms', resolution: 'N/A', orbit: 'LEO' },
      { name: 'Starlink-5001', noradId: 53390, nation: 'USA', operator: 'SpaceX', type: 'Comms', resolution: 'N/A', orbit: 'LEO' },
      { name: 'Starlink-6001', noradId: 57288, nation: 'USA', operator: 'SpaceX', type: 'V2 Mini', resolution: 'N/A', orbit: 'LEO' },
      // ── Sentinel (EU) ──
      { name: 'Sentinel-1A', noradId: 39634, nation: 'EU', operator: 'ESA', type: 'SAR', resolution: '5m', orbit: 'SSO' },
      { name: 'Sentinel-1C', noradId: 58024, nation: 'EU', operator: 'ESA', type: 'SAR', resolution: '5m', orbit: 'SSO' },
      { name: 'Sentinel-2A', noradId: 40697, nation: 'EU', operator: 'ESA', type: 'EO', resolution: '10m', orbit: 'SSO' },
      { name: 'Sentinel-2B', noradId: 42063, nation: 'EU', operator: 'ESA', type: 'EO', resolution: '10m', orbit: 'SSO' },
      { name: 'Sentinel-3A', noradId: 41335, nation: 'EU', operator: 'ESA', type: 'EO', resolution: '300m', orbit: 'SSO' },
      { name: 'Sentinel-3B', noradId: 43437, nation: 'EU', operator: 'ESA', type: 'EO', resolution: '300m', orbit: 'SSO' },
      { name: 'Sentinel-5P', noradId: 42969, nation: 'EU', operator: 'ESA', type: 'Atmosphere', resolution: '7km', orbit: 'SSO' },
      { name: 'Sentinel-6A (Jason-CS)', noradId: 46984, nation: 'EU', operator: 'ESA/NASA', type: 'Altimetry', resolution: 'N/A', orbit: 'LEO' },
      // ── Landsat ──
      { name: 'Landsat 8', noradId: 39084, nation: 'USA', operator: 'USGS/NASA', type: 'EO', resolution: '15m', orbit: 'SSO' },
      { name: 'Landsat 9', noradId: 49260, nation: 'USA', operator: 'USGS/NASA', type: 'EO', resolution: '15m', orbit: 'SSO' },
      // ── BlackSky ──
      { name: 'BlackSky Global-6', noradId: 48975, nation: 'USA', operator: 'BlackSky', type: 'EO', resolution: '1m', orbit: 'SSO' },
      { name: 'BlackSky Global-12', noradId: 51039, nation: 'USA', operator: 'BlackSky', type: 'EO', resolution: '0.5m', orbit: 'SSO' },
      // ── Spire ──
      { name: 'Lemur-2-v3.3.1', noradId: 44401, nation: 'USA', operator: 'Spire', type: 'GNSS-RO', resolution: 'N/A', orbit: 'LEO' },
    ]
  },

  military: {
    label: 'Military / ISR',
    color: '#ff1744',
    satellites: [
      // ── USA NRO/USSF ──
      { name: 'USA-224 (KH-11)', noradId: 37348, nation: 'USA', operator: 'NRO', type: 'Recon', resolution: '0.1m est', orbit: 'LEO' },
      { name: 'USA-245 (KH-11)', noradId: 39232, nation: 'USA', operator: 'NRO', type: 'Recon', resolution: '0.1m est', orbit: 'LEO' },
      { name: 'USA-314 (KH-11)', noradId: 51440, nation: 'USA', operator: 'NRO', type: 'Recon', resolution: '0.1m est', orbit: 'LEO' },
      { name: 'USA-338 (NROL-146)', noradId: 61420, nation: 'USA', operator: 'NRO', type: 'Recon', resolution: 'Classified', orbit: 'LEO' },
      { name: 'Topaz (USA-179)', noradId: 28888, nation: 'USA', operator: 'NRO', type: 'SIGINT', resolution: 'N/A', orbit: 'GEO' },
      { name: 'Mentor 7 (USA-272)', noradId: 41579, nation: 'USA', operator: 'NRO', type: 'SIGINT', resolution: 'N/A', orbit: 'GEO' },
      { name: 'Lacrosse-5 (USA-182)', noradId: 28646, nation: 'USA', operator: 'NRO', type: 'SAR', resolution: '0.3m est', orbit: 'LEO' },
      { name: 'SBIRS GEO-5', noradId: 49518, nation: 'USA', operator: 'USSF', type: 'Missile Warning', resolution: 'N/A', orbit: 'GEO' },
      { name: 'SBIRS GEO-6', noradId: 54582, nation: 'USA', operator: 'USSF', type: 'Missile Warning', resolution: 'N/A', orbit: 'GEO' },
      { name: 'GSSAP-3 (USA-270)', noradId: 41474, nation: 'USA', operator: 'USSF', type: 'Space Surveillance', resolution: 'N/A', orbit: 'GEO' },
      { name: 'WGS-10 (USA-291)', noradId: 44071, nation: 'USA', operator: 'USSF', type: 'Mil Comms', resolution: 'N/A', orbit: 'GEO' },
      // ── Russia ──
      { name: 'Persona 3 (Kosmos-2506)', noradId: 40258, nation: 'RUS', operator: 'MoD Russia', type: 'Recon', resolution: '0.3m est', orbit: 'SSO' },
      { name: 'Bars-M No.1 (Kosmos-2503)', noradId: 40420, nation: 'RUS', operator: 'MoD Russia', type: 'EO/Recon', resolution: '1m est', orbit: 'SSO' },
      { name: 'Lotos-S1 (Kosmos-2528)', noradId: 43032, nation: 'RUS', operator: 'MoD Russia', type: 'SIGINT', resolution: 'N/A', orbit: 'LEO' },
      { name: 'Neitron (Kosmos-2558)', noradId: 53328, nation: 'RUS', operator: 'MoD Russia', type: 'Inspector', resolution: 'N/A', orbit: 'LEO' },
      { name: 'Razdan (Kosmos-2570)', noradId: 58347, nation: 'RUS', operator: 'MoD Russia', type: 'Recon', resolution: '0.3m est', orbit: 'SSO' },
      { name: 'EKS-6 (Tundra)', noradId: 54534, nation: 'RUS', operator: 'VKS Russia', type: 'Early Warning', resolution: 'N/A', orbit: 'HEO' },
      // ── China ──
      { name: 'Gaofen-1', noradId: 39150, nation: 'CHN', operator: 'CNSA', type: 'EO/Recon', resolution: '2m', orbit: 'SSO' },
      { name: 'Gaofen-2', noradId: 40118, nation: 'CHN', operator: 'CNSA', type: 'EO/Recon', resolution: '0.8m', orbit: 'SSO' },
      { name: 'Gaofen-11', noradId: 43585, nation: 'CHN', operator: 'PLA', type: 'Recon', resolution: '0.1m est', orbit: 'SSO' },
      { name: 'Gaofen-12 02', noradId: 49490, nation: 'CHN', operator: 'PLA', type: 'SAR', resolution: '0.5m est', orbit: 'SSO' },
      { name: 'Yaogan-30A', noradId: 42706, nation: 'CHN', operator: 'PLA', type: 'SIGINT', resolution: 'N/A', orbit: 'LEO' },
      { name: 'Yaogan-33', noradId: 46492, nation: 'CHN', operator: 'PLA', type: 'SAR', resolution: '1m est', orbit: 'SSO' },
      { name: 'Yaogan-35A', noradId: 50258, nation: 'CHN', operator: 'PLA', type: 'SIGINT', resolution: 'N/A', orbit: 'LEO' },
      { name: 'Yaogan-39 01A', noradId: 57667, nation: 'CHN', operator: 'PLA', type: 'SIGINT', resolution: 'N/A', orbit: 'LEO' },
      { name: 'Shiyan-10 02', noradId: 55252, nation: 'CHN', operator: 'PLA', type: 'Experimental', resolution: 'N/A', orbit: 'SSO' },
      { name: 'TJS-9', noradId: 52940, nation: 'CHN', operator: 'PLA/SSF', type: 'SIGINT/Comms', resolution: 'N/A', orbit: 'GEO' },
      // ── SAR Commercial (Dual-Use) ──
      { name: 'Capella-2', noradId: 46495, nation: 'USA', operator: 'Capella Space', type: 'SAR', resolution: '0.5m', orbit: 'SSO' },
      { name: 'Capella-6', noradId: 51071, nation: 'USA', operator: 'Capella Space', type: 'SAR', resolution: '0.5m', orbit: 'SSO' },
      { name: 'ICEYE-X2', noradId: 43114, nation: 'FIN', operator: 'ICEYE', type: 'SAR', resolution: '1m', orbit: 'SSO' },
      { name: 'ICEYE-X14', noradId: 52762, nation: 'FIN', operator: 'ICEYE', type: 'SAR', resolution: '0.25m', orbit: 'SSO' },
      { name: 'Umbra-04', noradId: 52936, nation: 'USA', operator: 'Umbra Lab', type: 'SAR', resolution: '0.25m', orbit: 'SSO' },
      // ── Israel ──
      { name: 'Ofek-16', noradId: 45918, nation: 'ISR', operator: 'IDF', type: 'Recon', resolution: '0.5m est', orbit: 'Retro-SSO' },
      { name: 'Ofek-13', noradId: 55098, nation: 'ISR', operator: 'IDF', type: 'SAR', resolution: '0.5m', orbit: 'Retro-SSO' },
      // ── India ──
      { name: 'RISAT-2BR1', noradId: 44857, nation: 'IND', operator: 'ISRO', type: 'SAR', resolution: '0.35m', orbit: 'LEO' },
      { name: 'EMISAT', noradId: 44078, nation: 'IND', operator: 'DRDO', type: 'ELINT', resolution: 'N/A', orbit: 'SSO' },
      // ── South Korea ──
      { name: 'KOMPSAT-5', noradId: 39227, nation: 'KOR', operator: 'KARI', type: 'SAR', resolution: '1m', orbit: 'SSO' },
      // ── Japan ──
      { name: 'IGS Radar-7', noradId: 48032, nation: 'JPN', operator: 'Cabinet Office', type: 'SAR/Recon', resolution: '0.5m est', orbit: 'SSO' },
    ]
  },

  navigation: {
    label: 'Navigation / GNSS',
    color: '#ffd740',
    satellites: [
      // ── GPS (USA) — 31 operational, sampling key birds ──
      { name: 'GPS IIF-1 (SVN-62)', noradId: 36585, nation: 'USA', operator: 'USSF', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      { name: 'GPS IIF-5 (SVN-66)', noradId: 38833, nation: 'USA', operator: 'USSF', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      { name: 'GPS IIF-9 (SVN-68)', noradId: 40105, nation: 'USA', operator: 'USSF', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      { name: 'GPS IIF-12 (SVN-70)', noradId: 41019, nation: 'USA', operator: 'USSF', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      { name: 'GPS III-1 (SVN-74)', noradId: 43873, nation: 'USA', operator: 'USSF', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      { name: 'GPS III-3 (SVN-76)', noradId: 47541, nation: 'USA', operator: 'USSF', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      { name: 'GPS III-4 (SVN-77)', noradId: 48859, nation: 'USA', operator: 'USSF', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      { name: 'GPS III-5 (SVN-78)', noradId: 51684, nation: 'USA', operator: 'USSF', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      { name: 'GPS III-6 (SVN-79)', noradId: 55268, nation: 'USA', operator: 'USSF', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      // ── GLONASS (Russia) ──
      { name: 'GLONASS-M 734', noradId: 39620, nation: 'RUS', operator: 'Roscosmos', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      { name: 'GLONASS-M 747', noradId: 40315, nation: 'RUS', operator: 'Roscosmos', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      { name: 'GLONASS-M 755', noradId: 43508, nation: 'RUS', operator: 'Roscosmos', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      { name: 'GLONASS-M 758', noradId: 44299, nation: 'RUS', operator: 'Roscosmos', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      { name: 'GLONASS-K1 14L', noradId: 37829, nation: 'RUS', operator: 'Roscosmos', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      { name: 'GLONASS-K2 No.1', noradId: 57533, nation: 'RUS', operator: 'Roscosmos', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      // ── Galileo (EU) ──
      { name: 'Galileo-FOC FM1', noradId: 40128, nation: 'EU', operator: 'ESA', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      { name: 'Galileo-FOC FM4', noradId: 40544, nation: 'EU', operator: 'ESA', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      { name: 'Galileo-FOC FM10', noradId: 41860, nation: 'EU', operator: 'ESA', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      { name: 'Galileo-FOC FM14', noradId: 41862, nation: 'EU', operator: 'ESA', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      { name: 'Galileo-FOC FM22', noradId: 43564, nation: 'EU', operator: 'ESA', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      { name: 'Galileo-FOC FM26', noradId: 44366, nation: 'EU', operator: 'ESA', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      // ── BeiDou (China) ──
      { name: 'BeiDou-3 M1', noradId: 43001, nation: 'CHN', operator: 'CNSA', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      { name: 'BeiDou-3 M3', noradId: 43207, nation: 'CHN', operator: 'CNSA', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      { name: 'BeiDou-3 M13', noradId: 43706, nation: 'CHN', operator: 'CNSA', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      { name: 'BeiDou-3 M19', noradId: 44204, nation: 'CHN', operator: 'CNSA', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      { name: 'BeiDou-3 M23', noradId: 44709, nation: 'CHN', operator: 'CNSA', type: 'Navigation', resolution: 'N/A', orbit: 'MEO' },
      { name: 'BeiDou-3 G3', noradId: 45807, nation: 'CHN', operator: 'CNSA', type: 'Navigation', resolution: 'N/A', orbit: 'GEO' },
      // ── QZSS (Japan) ──
      { name: 'QZS-1 (Michibiki)', noradId: 37158, nation: 'JPN', operator: 'JAXA', type: 'Navigation', resolution: 'N/A', orbit: 'HEO' },
      { name: 'QZS-2 (Michibiki-2)', noradId: 42738, nation: 'JPN', operator: 'JAXA', type: 'Navigation', resolution: 'N/A', orbit: 'HEO' },
      { name: 'QZS-3 (Michibiki-3)', noradId: 42917, nation: 'JPN', operator: 'JAXA', type: 'Navigation', resolution: 'N/A', orbit: 'GEO' },
      { name: 'QZS-4 (Michibiki-4)', noradId: 42965, nation: 'JPN', operator: 'JAXA', type: 'Navigation', resolution: 'N/A', orbit: 'HEO' },
      // ── NavIC (India) ──
      { name: 'IRNSS-1A', noradId: 39199, nation: 'IND', operator: 'ISRO', type: 'Navigation', resolution: 'N/A', orbit: 'GEO' },
      { name: 'IRNSS-1B', noradId: 39635, nation: 'IND', operator: 'ISRO', type: 'Navigation', resolution: 'N/A', orbit: 'GEO' },
    ]
  },

  weather: {
    label: 'Weather / Climate',
    color: '#69f0ae',
    satellites: [
      // ── US Geostationary ──
      { name: 'GOES-16 (East)', noradId: 41866, nation: 'USA', operator: 'NOAA', type: 'Weather', resolution: '0.5km', orbit: 'GEO' },
      { name: 'GOES-18 (West)', noradId: 51850, nation: 'USA', operator: 'NOAA', type: 'Weather', resolution: '0.5km', orbit: 'GEO' },
      { name: 'GOES-19', noradId: 60185, nation: 'USA', operator: 'NOAA', type: 'Weather', resolution: '0.5km', orbit: 'GEO' },
      // ── US Polar ──
      { name: 'NOAA-20 (JPSS-1)', noradId: 43013, nation: 'USA', operator: 'NOAA', type: 'Weather', resolution: '375m', orbit: 'SSO' },
      { name: 'NOAA-21 (JPSS-2)', noradId: 54234, nation: 'USA', operator: 'NOAA', type: 'Weather', resolution: '375m', orbit: 'SSO' },
      { name: 'Suomi NPP', noradId: 37849, nation: 'USA', operator: 'NASA/NOAA', type: 'Weather', resolution: '375m', orbit: 'SSO' },
      { name: 'NOAA-19', noradId: 33591, nation: 'USA', operator: 'NOAA', type: 'Weather', resolution: '1.1km', orbit: 'SSO' },
      // ── European ──
      { name: 'Meteosat-11', noradId: 40732, nation: 'EU', operator: 'EUMETSAT', type: 'Weather', resolution: '1km', orbit: 'GEO' },
      { name: 'MTG-I1', noradId: 54742, nation: 'EU', operator: 'EUMETSAT', type: 'Weather', resolution: '0.5km', orbit: 'GEO' },
      { name: 'MetOp-B', noradId: 38771, nation: 'EU', operator: 'EUMETSAT', type: 'Weather', resolution: '1.1km', orbit: 'SSO' },
      { name: 'MetOp-C', noradId: 43689, nation: 'EU', operator: 'EUMETSAT', type: 'Weather', resolution: '1.1km', orbit: 'SSO' },
      // ── Japanese ──
      { name: 'Himawari-8', noradId: 40267, nation: 'JPN', operator: 'JMA', type: 'Weather', resolution: '0.5km', orbit: 'GEO' },
      { name: 'Himawari-9', noradId: 41836, nation: 'JPN', operator: 'JMA', type: 'Weather', resolution: '0.5km', orbit: 'GEO' },
      // ── Chinese ──
      { name: 'FengYun-4A', noradId: 41882, nation: 'CHN', operator: 'CMA', type: 'Weather', resolution: '0.5km', orbit: 'GEO' },
      { name: 'FengYun-4B', noradId: 52576, nation: 'CHN', operator: 'CMA', type: 'Weather', resolution: '0.25km', orbit: 'GEO' },
      { name: 'FengYun-3E', noradId: 48903, nation: 'CHN', operator: 'CMA', type: 'Weather', resolution: '250m', orbit: 'SSO' },
      { name: 'FengYun-3F', noradId: 57489, nation: 'CHN', operator: 'CMA', type: 'Weather', resolution: '250m', orbit: 'LEO' },
      // ── Indian ──
      { name: 'INSAT-3DR', noradId: 41752, nation: 'IND', operator: 'ISRO', type: 'Weather', resolution: '1km', orbit: 'GEO' },
      { name: 'INSAT-3DS', noradId: 59054, nation: 'IND', operator: 'ISRO', type: 'Weather', resolution: '1km', orbit: 'GEO' },
      // ── Russian ──
      { name: 'Meteor-M No.2-3', noradId: 57166, nation: 'RUS', operator: 'Roscosmos', type: 'Weather', resolution: '1km', orbit: 'SSO' },
      { name: 'Elektro-L No.3', noradId: 49520, nation: 'RUS', operator: 'Roscosmos', type: 'Weather', resolution: '1km', orbit: 'GEO' },
      // ── Korean ──
      { name: 'GEO-KOMPSAT-2A (GK2A)', noradId: 43823, nation: 'KOR', operator: 'KMA', type: 'Weather', resolution: '0.5km', orbit: 'GEO' },
      // ── US Military Weather ──
      { name: 'DMSP F-18', noradId: 35951, nation: 'USA', operator: 'USSF', type: 'Mil Weather', resolution: '0.55km', orbit: 'SSO' },
      { name: 'DMSP F-19', noradId: 39630, nation: 'USA', operator: 'USSF', type: 'Mil Weather', resolution: '0.55km', orbit: 'SSO' },
      // ── Climate/Oceans ──
      { name: 'DSCOVR', noradId: 40390, nation: 'USA', operator: 'NOAA/NASA', type: 'Space Weather', resolution: 'N/A', orbit: 'L1' },
      { name: 'ICESat-2', noradId: 43613, nation: 'USA', operator: 'NASA', type: 'Ice/Climate', resolution: 'N/A', orbit: 'SSO' },
      { name: 'GRACE-FO 1', noradId: 43476, nation: 'USA', operator: 'NASA/DLR', type: 'Gravity', resolution: 'N/A', orbit: 'LEO' },
      { name: 'GRACE-FO 2', noradId: 43477, nation: 'USA', operator: 'NASA/DLR', type: 'Gravity', resolution: 'N/A', orbit: 'LEO' },
      { name: 'CloudSat', noradId: 29107, nation: 'USA', operator: 'NASA/CSA', type: 'Cloud Profiler', resolution: 'N/A', orbit: 'SSO' },
    ]
  },

  comms: {
    label: 'Communications',
    color: '#b388ff',
    satellites: [
      // ── GEO Broadcast/Backbone ──
      { name: 'Intelsat 901', noradId: 26824, nation: 'INT', operator: 'Intelsat', type: 'Comms', resolution: 'N/A', orbit: 'GEO' },
      { name: 'Intelsat 10-02', noradId: 28358, nation: 'INT', operator: 'Intelsat', type: 'Comms', resolution: 'N/A', orbit: 'GEO' },
      { name: 'Intelsat 39', noradId: 44476, nation: 'INT', operator: 'Intelsat', type: 'Comms', resolution: 'N/A', orbit: 'GEO' },
      { name: 'SES-10', noradId: 42432, nation: 'LUX', operator: 'SES', type: 'Comms', resolution: 'N/A', orbit: 'GEO' },
      { name: 'SES-17', noradId: 49055, nation: 'LUX', operator: 'SES', type: 'HTS', resolution: 'N/A', orbit: 'GEO' },
      { name: 'SES-22', noradId: 52903, nation: 'LUX', operator: 'SES', type: 'C-band', resolution: 'N/A', orbit: 'GEO' },
      { name: 'Eutelsat 36B', noradId: 33436, nation: 'FRA', operator: 'Eutelsat', type: 'Comms', resolution: 'N/A', orbit: 'GEO' },
      { name: 'Hotbird 13G', noradId: 54384, nation: 'FRA', operator: 'Eutelsat', type: 'DBS', resolution: 'N/A', orbit: 'GEO' },
      { name: 'Türksat 5B', noradId: 50734, nation: 'TUR', operator: 'Türksat', type: 'HTS', resolution: 'N/A', orbit: 'GEO' },
      { name: 'Arabsat 6A', noradId: 44186, nation: 'SAU', operator: 'Arabsat', type: 'Comms', resolution: 'N/A', orbit: 'GEO' },
      { name: 'Chinasat-6D', noradId: 58012, nation: 'CHN', operator: 'ChinaSat', type: 'Comms', resolution: 'N/A', orbit: 'GEO' },
      { name: 'JCSAT-17', noradId: 46114, nation: 'JPN', operator: 'SKY Perfect', type: 'Comms', resolution: 'N/A', orbit: 'GEO' },
      // ── LEO Constellations ──
      { name: 'Iridium NEXT-106', noradId: 43075, nation: 'USA', operator: 'Iridium', type: 'Comms', resolution: 'N/A', orbit: 'LEO' },
      { name: 'Iridium NEXT-118', noradId: 43252, nation: 'USA', operator: 'Iridium', type: 'Comms', resolution: 'N/A', orbit: 'LEO' },
      { name: 'Iridium NEXT-139', noradId: 43571, nation: 'USA', operator: 'Iridium', type: 'Comms', resolution: 'N/A', orbit: 'LEO' },
      { name: 'Iridium NEXT-152', noradId: 43929, nation: 'USA', operator: 'Iridium', type: 'Comms', resolution: 'N/A', orbit: 'LEO' },
      { name: 'Globalstar M083', noradId: 40269, nation: 'USA', operator: 'Globalstar', type: 'Comms', resolution: 'N/A', orbit: 'LEO' },
      { name: 'Globalstar M085', noradId: 40271, nation: 'USA', operator: 'Globalstar', type: 'Comms', resolution: 'N/A', orbit: 'LEO' },
      { name: 'ORBCOMM FM-108', noradId: 40086, nation: 'USA', operator: 'ORBCOMM', type: 'IoT/M2M', resolution: 'N/A', orbit: 'LEO' },
      // ── O3b MEO (SES) ──
      { name: 'O3b FM1', noradId: 39188, nation: 'LUX', operator: 'SES', type: 'HTS', resolution: 'N/A', orbit: 'MEO' },
      { name: 'O3b FM16', noradId: 44109, nation: 'LUX', operator: 'SES', type: 'HTS', resolution: 'N/A', orbit: 'MEO' },
      { name: 'O3b mPOWER 1', noradId: 54742, nation: 'LUX', operator: 'SES', type: 'HTS', resolution: 'N/A', orbit: 'MEO' },
      // ── OneWeb ──
      { name: 'OneWeb-0012', noradId: 44057, nation: 'UK', operator: 'OneWeb', type: 'Comms', resolution: 'N/A', orbit: 'LEO' },
      { name: 'OneWeb-0395', noradId: 49724, nation: 'UK', operator: 'OneWeb', type: 'Comms', resolution: 'N/A', orbit: 'LEO' },
      { name: 'OneWeb-0585', noradId: 55838, nation: 'UK', operator: 'OneWeb', type: 'Comms', resolution: 'N/A', orbit: 'LEO' },
      // ── Telesat / Kuiper ──
      { name: 'Telesat LEO Prototype', noradId: 43113, nation: 'CAN', operator: 'Telesat', type: 'Comms', resolution: 'N/A', orbit: 'LEO' },
    ]
  },

  science: {
    label: 'Science / Research',
    color: '#ea80fc',
    satellites: [
      // ── NASA Missions ──
      { name: 'Terra (EOS AM-1)', noradId: 25994, nation: 'USA', operator: 'NASA', type: 'Earth Science', resolution: '15m', orbit: 'SSO' },
      { name: 'Aqua (EOS PM-1)', noradId: 27424, nation: 'USA', operator: 'NASA', type: 'Earth Science', resolution: '250m', orbit: 'SSO' },
      { name: 'Aura', noradId: 28376, nation: 'USA', operator: 'NASA', type: 'Atmosphere', resolution: 'N/A', orbit: 'SSO' },
      { name: 'OCO-2', noradId: 40059, nation: 'USA', operator: 'NASA', type: 'CO2 Monitor', resolution: 'N/A', orbit: 'SSO' },
      { name: 'PACE', noradId: 58835, nation: 'USA', operator: 'NASA', type: 'Ocean/Atmosphere', resolution: '1km', orbit: 'SSO' },
      { name: 'SWOT', noradId: 54752, nation: 'USA', operator: 'NASA/CNES', type: 'Ocean Altimetry', resolution: 'N/A', orbit: 'LEO' },
      { name: 'GPM Core', noradId: 39574, nation: 'USA', operator: 'NASA/JAXA', type: 'Precipitation', resolution: 'N/A', orbit: 'LEO' },
      { name: 'CALIPSO', noradId: 29108, nation: 'USA', operator: 'NASA/CNES', type: 'Lidar', resolution: 'N/A', orbit: 'SSO' },
      // ── ESA Missions ──
      { name: 'CryoSat-2', noradId: 36508, nation: 'EU', operator: 'ESA', type: 'Ice Monitor', resolution: 'N/A', orbit: 'LEO' },
      { name: 'Aeolus', noradId: 43600, nation: 'EU', operator: 'ESA', type: 'Wind Lidar', resolution: 'N/A', orbit: 'SSO' },
      { name: 'EarthCARE', noradId: 59866, nation: 'EU', operator: 'ESA/JAXA', type: 'Cloud/Aerosol', resolution: 'N/A', orbit: 'SSO' },
      { name: 'SMOS', noradId: 36036, nation: 'EU', operator: 'ESA', type: 'Soil Moisture', resolution: '50km', orbit: 'SSO' },
      // ── JAXA ──
      { name: 'ALOS-2 (DAICHI-2)', noradId: 39766, nation: 'JPN', operator: 'JAXA', type: 'SAR/Science', resolution: '1m', orbit: 'SSO' },
      { name: 'GCOM-C (SHIKISAI)', noradId: 43065, nation: 'JPN', operator: 'JAXA', type: 'Climate', resolution: '250m', orbit: 'SSO' },
      // ── Other ──
      { name: 'PROBA-V', noradId: 39159, nation: 'BEL', operator: 'ESA', type: 'Vegetation', resolution: '100m', orbit: 'SSO' },
      { name: 'TanSat', noradId: 41898, nation: 'CHN', operator: 'CAS', type: 'CO2 Monitor', resolution: 'N/A', orbit: 'SSO' },
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
