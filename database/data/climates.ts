export interface ClimateData {
  id: string;
  name: string;
  type: string;
  region: string;
  description: string;
  latitude: number;
  longitude: number;
  avgWinterTemp: number; // Celsius
  avgSummerTemp: number; // Celsius
  humidity: number; // Percentage
  solarRadiation: number; // W/m2
  windSpeed: number; // m/s
  groundTemp: number; // Celsius
  altitude: number; // meters
}

export const CLIMATE_PROFILES: ClimateData[] = [
  {
    id: 'cold_mountain',
    name: 'Cold Mountain',
    type: 'Cold Mountain',
    region: 'Himalayas / Central Asia',
    description: 'High altitude cold desert with extreme winter temperatures and high solar radiation.',
    latitude: 34.1526, // Leh, Ladakh
    longitude: 77.5771,
    avgWinterTemp: -15,
    avgSummerTemp: 25,
    humidity: 30,
    solarRadiation: 800,
    windSpeed: 8,
    groundTemp: -5,
    altitude: 3500
  },
  {
    id: 'cold_dry',
    name: 'Cold Dry',
    type: 'Cold Dry',
    region: 'Subarctic / North America',
    description: 'Low temperature with very low humidity and moderate solar exposure.',
    latitude: 64.8378, // Fairbanks, Alaska
    longitude: -147.7164,
    avgWinterTemp: -10,
    avgSummerTemp: 20,
    humidity: 20,
    solarRadiation: 500,
    windSpeed: 10,
    groundTemp: -2,
    altitude: 1000
  },
  {
    id: 'hot_dry',
    name: 'Hot Dry',
    type: 'Hot Dry',
    region: 'Middle East / Desert',
    description: 'Extremely hot and dry with significant diurnal temperature variation.',
    latitude: 24.7136, // Riyadh, Saudi Arabia
    longitude: 46.6753,
    avgWinterTemp: 15,
    avgSummerTemp: 40,
    humidity: 15,
    solarRadiation: 900,
    windSpeed: 5,
    groundTemp: 30,
    altitude: 500
  },
  {
    id: 'hot_humid',
    name: 'Hot Humid',
    type: 'Hot Humid',
    region: 'Equatorial / Southeast Asia',
    description: 'Hot and highly humid year-round with heavy rainfall and dense cloud cover.',
    latitude: 1.3521, // Singapore
    longitude: 103.8198,
    avgWinterTemp: 26,
    avgSummerTemp: 32,
    humidity: 85,
    solarRadiation: 600,
    windSpeed: 2,
    groundTemp: 25,
    altitude: 100
  },
  {
    id: 'temperate',
    name: 'Temperate',
    type: 'Temperate',
    region: 'Western Europe',
    description: 'Moderate temperatures and humidity, distinct seasonal changes.',
    latitude: 48.8566, // Paris, France
    longitude: 2.3522,
    avgWinterTemp: 5,
    avgSummerTemp: 25,
    humidity: 60,
    solarRadiation: 650,
    windSpeed: 4,
    groundTemp: 12,
    altitude: 200
  },
  {
    id: 'coastal',
    name: 'Coastal',
    type: 'Coastal',
    region: 'Oceania / Pacific',
    description: 'High humidity, moderate temperatures, high winds and salt exposure.',
    latitude: -33.8688, // Sydney, Australia
    longitude: 151.2093,
    avgWinterTemp: 10,
    avgSummerTemp: 28,
    humidity: 75,
    solarRadiation: 700,
    windSpeed: 12,
    groundTemp: 15,
    altitude: 10
  }
];

// Haversine formula to find the nearest offline climate profile
export function getOfflineClimateProfile(lat: number, lon: number): ClimateData {
  let nearestProfile = CLIMATE_PROFILES[0];
  let minDistance = Infinity;

  const toRad = (value: number) => (value * Math.PI) / 180;

  for (const profile of CLIMATE_PROFILES) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(profile.latitude - lat);
    const dLon = toRad(profile.longitude - lon);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat)) * Math.cos(toRad(profile.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    if (distance < minDistance) {
      minDistance = distance;
      nearestProfile = profile;
    }
  }

  return nearestProfile;
}
