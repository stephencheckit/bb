/**
 * Time window generator
 * Creates 3-hour beach visit windows with scores
 */

import { Beach } from '../models/beach';
import { Window, ConditionSnapshot } from '../models/conditions';
import { UserPreferences } from '../models/plan';
import { calculateBeachScore } from './beach-score';

export interface WindowOptions {
  duration: number; // hours
  count: number; // number of windows to generate
  preferences?: UserPreferences;
}

const DEFAULT_OPTIONS: WindowOptions = {
  duration: 3, // 3-hour windows
  count: 4, // next 12 hours (4 windows)
};

/**
 * Generate time windows for beach visit
 */
export async function generateWindows(
  beach: Beach,
  conditions: ConditionSnapshot[],
  options: Partial<WindowOptions> = {}
): Promise<Window[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const windows: Window[] = [];
  const now = new Date();

  // Create windows from available condition snapshots
  for (let i = 0; i < Math.min(opts.count, conditions.length); i++) {
    const snapshot = conditions[i];
    
    // Skip past windows
    if (snapshot.timestamp < now) {
      continue;
    }

    // Calculate score for this window
    const scored = calculateBeachScore(snapshot, opts.preferences);
    
    // Set window duration
    scored.window.endTime = new Date(
      scored.window.startTime.getTime() + opts.duration * 60 * 60 * 1000
    );

    windows.push(scored.window);
  }

  // Sort by score (best first)
  windows.sort((a, b) => b.score - a.score);

  // Mark "Go Now" window (best window that includes current time)
  const currentTime = now.getTime();
  const goNowWindow = windows.find((w) => {
    const start = w.startTime.getTime();
    const end = w.endTime.getTime();
    return currentTime >= start && currentTime <= end;
  });

  if (goNowWindow) {
    goNowWindow.isGoNow = true;
  } else {
    // If no window contains current time, mark the best window
    // that starts within the next hour as "Go Now"
    const nextHour = currentTime + 60 * 60 * 1000;
    const upcomingWindow = windows.find(
      (w) => w.startTime.getTime() >= currentTime && w.startTime.getTime() <= nextHour
    );
    
    if (upcomingWindow && upcomingWindow.score >= 60) {
      upcomingWindow.isGoNow = true;
    }
  }

  return windows;
}

/**
 * Find the best window from a list
 */
export function findBestWindow(windows: Window[]): Window | undefined {
  if (windows.length === 0) return undefined;
  
  return windows.reduce((best, current) => 
    current.score > best.score ? current : best
  );
}

/**
 * Check if a window is suitable for going (score threshold)
 */
export function isWindowSuitable(window: Window, minScore: number = 60): boolean {
  return window.score >= minScore;
}

/**
 * Get windows filtered by minimum score
 */
export function getGoodWindows(windows: Window[], minScore: number = 70): Window[] {
  return windows.filter((w) => w.score >= minScore);
}

/**
 * Format window time for display
 */
export function formatWindowTime(window: Window): string {
  const startTime = window.startTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  
  const endTime = window.endTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return `${startTime} - ${endTime}`;
}

/**
 * Check if window is happening now
 */
export function isWindowNow(window: Window): boolean {
  const now = Date.now();
  return now >= window.startTime.getTime() && now <= window.endTime.getTime();
}

