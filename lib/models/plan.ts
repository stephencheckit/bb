/**
 * Trip planning models
 */

import { Beach, NearbyPlace } from './beach';
import { Window } from './conditions';

export interface Plan {
  id: string;
  beach: Beach;
  window: Window;
  departureTime: Date;
  arrivalTime: Date;
  checklist: ChecklistItem[];
  nearbyPlaces: NearbyPlace[];
  parkingTips: string;
  createdAt: Date;
}

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  item: string;
  reason?: string; // Why this item is recommended
  checked: boolean;
  priority: 'essential' | 'recommended' | 'optional';
}

export type ChecklistCategory =
  | 'essentials'
  | 'sun-protection'
  | 'hydration'
  | 'safety'
  | 'comfort'
  | 'fun';

export interface UserPreferences {
  favoriteBeaches: string[]; // beach IDs
  tempRange: {
    min: number;
    max: number;
  };
  windTolerance: number; // max wind speed in mph
  activityGoals: ActivityGoal[];
  gearDefaults: GearDefaults;
}

export type ActivityGoal = 
  | 'chill'
  | 'swim'
  | 'walk'
  | 'photography'
  | 'shelling'
  | 'reading';

export interface GearDefaults {
  hasUmbrella: boolean;
  hasChairs: boolean;
  hasCooler: boolean;
  hasSnorkelGear: boolean;
  hasBeachToys: boolean;
}

