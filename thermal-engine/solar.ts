// src/engine/solar.ts

/**
 * Calculates solar position (altitude, azimuth) and sun vector for 3D environment.
 * @param latitude Latitude in degrees (-90 to 90)
 * @param longitude Longitude in degrees (-180 to 180)
 * @param season 'Winter', 'Summer', or 'Shoulder'
 * @param hour Time of day in hours (0.0 to 23.99)
 * @returns Object containing altitude (deg), azimuth (deg), and sunVector [x, y, z]
 */
export function calculateSolarPosition(latitude: number, longitude: number, season: string, hour: number) {
  // 1. Determine day of year (N) based on season
  // Approximations for Northern Hemisphere vs Southern Hemisphere
  let N = 80; // Shoulder (equinox, March 21)
  if (season === 'Winter') {
    N = latitude >= 0 ? 355 : 172; // Dec 21 for NH, Jun 21 for SH
  } else if (season === 'Summer') {
    N = latitude >= 0 ? 172 : 355; // Jun 21 for NH, Dec 21 for SH
  }

  // 2. Solar Declination (delta)
  const declination = 23.45 * Math.sin((360 / 365) * (N - 81) * (Math.PI / 180));

  // 3. Hour Angle (H)
  // Assuming hour is local solar time for simplicity (12 = solar noon)
  const hourAngle = 15 * (hour - 12);

  // Convert to radians for Math trig functions
  const latRad = latitude * (Math.PI / 180);
  const decRad = declination * (Math.PI / 180);
  const hRad = hourAngle * (Math.PI / 180);

  // 4. Solar Altitude (theta)
  const sinTheta = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(hRad);
  const altitudeRad = Math.asin(Math.max(-1, Math.min(1, sinTheta)));
  const altitude = altitudeRad * (180 / Math.PI);

  // 5. Solar Azimuth (phi)
  const cosTheta = Math.cos(altitudeRad);
  let azimuthRad = 0;
  
  if (Math.abs(cosTheta) > 0.0001) {
    const cosPhi = (Math.sin(decRad) * Math.cos(latRad) - Math.cos(decRad) * Math.sin(latRad) * Math.cos(hRad)) / cosTheta;
    azimuthRad = Math.acos(Math.max(-1, Math.min(1, cosPhi)));
  }

  // Adjust azimuth based on time of day
  // North=0, East=90, South=180, West=270
  let azimuth = azimuthRad * (180 / Math.PI);
  if (hourAngle > 0) { // Afternoon
    azimuth = 360 - azimuth;
  }

  // 6. Convert to 3D Cartesian Vector for Three.js
  // Three.js Coordinate System:
  // Y is up.
  // -Z is North, +Z is South, +X is East, -X is West.
  const altR = altitudeRad;
  const azR = azimuth * (Math.PI / 180);
  
  const d = 50; // Distance multiplier for light/sun position
  
  const x = d * Math.cos(altR) * Math.sin(azR);
  // Keep Y slightly above 0 even at night so the directional light doesn't glitch under the floor completely,
  // or let it go negative so the sky becomes dark.
  const y = d * Math.sin(altR);
  const z = -d * Math.cos(altR) * Math.cos(azR);

  return {
    altitude,
    azimuth,
    sunVector: [x, y, z] as [number, number, number]
  };
}
