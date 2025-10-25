/**
 * Formatting utilities for dates, times, numbers
 */

import { format, formatDistance as formatDateDistance, isToday, isTomorrow } from 'date-fns';

/**
 * Format time for display (e.g., "10:30 AM")
 */
export function formatTime(date: Date): string {
  return format(date, 'h:mm a');
}

/**
 * Format date for display (e.g., "Oct 25, 2025")
 */
export function formatDate(date: Date): string {
  return format(date, 'MMM d, yyyy');
}

/**
 * Format date with time (e.g., "Oct 25, 10:30 AM")
 */
export function formatDateTime(date: Date): string {
  return format(date, 'MMM d, h:mm a');
}

/**
 * Format relative time (e.g., "in 2 hours", "30 minutes ago")
 */
export function formatRelativeTime(date: Date): string {
  return formatDateDistance(date, new Date(), { addSuffix: true });
}

/**
 * Format day label (e.g., "Today", "Tomorrow", "Wednesday")
 */
export function formatDayLabel(date: Date): string {
  if (isToday(date)) {
    return 'Today';
  }
  if (isTomorrow(date)) {
    return 'Tomorrow';
  }
  return format(date, 'EEEE');
}

/**
 * Format temperature (e.g., "75°F", "23°C")
 */
export function formatTemp(temp: number, unit: 'F' | 'C' = 'F'): string {
  return `${Math.round(temp)}°${unit}`;
}

/**
 * Format wind speed (e.g., "10 mph")
 */
export function formatWindSpeed(speed: number): string {
  return `${Math.round(speed)} mph`;
}

/**
 * Format UV index (e.g., "UV 7")
 */
export function formatUV(uvIndex: number): string {
  return `UV ${uvIndex.toFixed(1)}`;
}

/**
 * Format tide height (e.g., "2.5 ft")
 */
export function formatTideHeight(height: number): string {
  return `${height.toFixed(1)} ft`;
}

/**
 * Format percentage (e.g., "75%")
 */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Format duration in minutes to human readable (e.g., "2h 30m")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format score as percentage (e.g., "85%")
 */
export function formatScore(score: number): string {
  return `${score}`;
}

/**
 * Format cardinal direction from degrees (e.g., "NW", "SE")
 */
export function formatWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

/**
 * Format time range (e.g., "10:30 AM - 1:30 PM")
 */
export function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

