/**
 * Beach data models and types
 */

export interface Beach {
  id: string;
  name: string;
  lat: number;
  lon: number;
  noaaStationId: string;
  facilities: BeachFacilities;
  parking: ParkingInfo;
  description?: string;
  accessibility?: string;
}

export interface BeachFacilities {
  restroom: boolean;
  shower: boolean;
  lifeguard: boolean;
  foodNearby: boolean;
  shadeStructures: boolean;
  beachWheelchair?: boolean;
}

export interface ParkingInfo {
  available: boolean;
  cost?: string;
  notes?: string;
}

export interface NearbyPlace {
  id: string;
  name: string;
  type: 'restaurant' | 'cafe' | 'bar' | 'convenience' | 'grocery' | 'liquor' | 'beach-shop';
  lat: number;
  lon: number;
  distance: number; // in meters
  walkTime?: number; // in minutes
  openingHours?: string;
  isOpen?: boolean;
}

