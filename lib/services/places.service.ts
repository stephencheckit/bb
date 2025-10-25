/**
 * OpenStreetMap Overpass API Service
 * Fetches nearby places (restaurants, cafes, bars)
 */

import { NearbyPlace } from '../models/beach';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Get nearby places using OpenStreetMap data
 */
export async function getNearbyPlaces(
  lat: number,
  lon: number,
  radius: number = 1500, // meters
  types: string[] = ['restaurant', 'cafe', 'bar', 'fast_food']
): Promise<NearbyPlace[]> {
  // Build Overpass QL query
  const amenityFilters = types.map(t => `amenity=${t}`).join('|');
  
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"~"${amenityFilters}"](around:${radius},${lat},${lon});
      way["amenity"~"${amenityFilters}"](around:${radius},${lat},${lon});
    );
    out body;
    >;
    out skel qt;
  `;

  try {
    const response = await fetch(OVERPASS_URL, {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();

    // Process results
    const places: NearbyPlace[] = data.elements
      .filter((el: { tags?: { name?: string } }) => el.tags && el.tags.name)
      .map((el: { type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags: { name: string; amenity: string; opening_hours?: string } }) => {
        // Handle both nodes and ways
        const placeLat = el.lat || (el.center?.lat);
        const placeLon = el.lon || (el.center?.lon);

        if (!placeLat || !placeLon) {
          return null;
        }

        const distance = calculateDistance(lat, lon, placeLat, placeLon);
        const walkTime = Math.ceil(distance / 83); // Average walking speed: 83m/min

        return {
          id: `osm-${el.type}-${el.id}`,
          name: el.tags.name,
          type: mapAmenityType(el.tags.amenity),
          lat: placeLat,
          lon: placeLon,
          distance: Math.round(distance),
          walkTime,
          openingHours: el.tags.opening_hours,
          isOpen: undefined, // Would need additional logic to parse opening hours
        };
      })
      .filter((place: NearbyPlace | null): place is NearbyPlace => place !== null);

    // Sort by distance
    places.sort((a, b) => a.distance - b.distance);

    return places;
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    return [];
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Map OSM amenity types to our simplified types
 */
function mapAmenityType(
  amenity: string
): 'restaurant' | 'cafe' | 'bar' | 'convenience' {
  switch (amenity) {
    case 'restaurant':
    case 'fast_food':
      return 'restaurant';
    case 'cafe':
      return 'cafe';
    case 'bar':
    case 'pub':
      return 'bar';
    case 'convenience':
    case 'shop':
      return 'convenience';
    default:
      return 'restaurant';
  }
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Format walk time for display
 */
export function formatWalkTime(minutes: number): string {
  if (minutes < 1) {
    return 'Less than 1 min';
  }
  if (minutes === 1) {
    return '1 min walk';
  }
  return `${minutes} min walk`;
}

