/**
 * localStorage wrapper for client-side data persistence
 */

const STORAGE_KEYS = {
  FAVORITES: 'beach-buddy-favorites',
  PREFERENCES: 'beach-buddy-preferences',
  RECENT_BEACHES: 'beach-buddy-recent',
  CHECKLIST: 'beach-buddy-checklist',
} as const;

/**
 * Save data to localStorage
 */
export function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Load data from localStorage
 */
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
}

/**
 * Remove data from localStorage
 */
export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

/**
 * Clear all Beach Buddy data from localStorage
 */
export function clearAllStorage(): void {
  if (typeof window === 'undefined') return;
  
  Object.values(STORAGE_KEYS).forEach((key) => {
    removeFromStorage(key);
  });
}

// Convenience functions for specific data types

export function saveFavorites(beachIds: string[]): void {
  saveToStorage(STORAGE_KEYS.FAVORITES, beachIds);
}

export function loadFavorites(): string[] {
  return loadFromStorage<string[]>(STORAGE_KEYS.FAVORITES, []);
}

export function savePreferences(preferences: Record<string, unknown>): void {
  saveToStorage(STORAGE_KEYS.PREFERENCES, preferences);
}

export function loadPreferences(): Record<string, unknown> | null {
  return loadFromStorage(STORAGE_KEYS.PREFERENCES, null);
}

export function saveRecentBeaches(beachIds: string[]): void {
  // Keep only last 5
  const limited = beachIds.slice(0, 5);
  saveToStorage(STORAGE_KEYS.RECENT_BEACHES, limited);
}

export function loadRecentBeaches(): string[] {
  return loadFromStorage<string[]>(STORAGE_KEYS.RECENT_BEACHES, []);
}

// Using a generic type to properly handle checklist items
export function saveChecklist<T>(planId: string, checklist: T[]): void {
  const key = `${STORAGE_KEYS.CHECKLIST}-${planId}`;
  saveToStorage(key, checklist);
}

export function loadChecklist<T>(planId: string): T[] {
  const key = `${STORAGE_KEYS.CHECKLIST}-${planId}`;
  return loadFromStorage<T[]>(key, []);
}

