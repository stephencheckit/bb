/**
 * Time of day utilities for dynamic UI theming
 */

export type TimeOfDay = 'dawn' | 'morning' | 'day' | 'afternoon' | 'evening' | 'dusk' | 'night';

export interface TimeOfDayTheme {
  period: TimeOfDay;
  background: string;
  text: string;
  emoji: string;
}

/**
 * Get the current time of day period
 */
export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();

  if (hour >= 5 && hour < 7) return 'dawn';      // 5-7am: Dawn
  if (hour >= 7 && hour < 10) return 'morning';  // 7-10am: Morning
  if (hour >= 10 && hour < 14) return 'day';     // 10am-2pm: Day
  if (hour >= 14 && hour < 17) return 'afternoon'; // 2-5pm: Afternoon
  if (hour >= 17 && hour < 19) return 'evening';  // 5-7pm: Evening
  if (hour >= 19 && hour < 21) return 'dusk';    // 7-9pm: Dusk
  return 'night';                                 // 9pm-5am: Night
}

/**
 * Get theme configuration for current time of day
 */
export function getTimeOfDayTheme(date?: Date): TimeOfDayTheme {
  const period = getTimeOfDay(date);

  const themes: Record<TimeOfDay, TimeOfDayTheme> = {
    dawn: {
      period: 'dawn',
      background: 'from-rose-100 via-orange-50 to-amber-100',
      text: 'Dawn',
      emoji: '🌅',
    },
    morning: {
      period: 'morning',
      background: 'from-sky-100 via-blue-50 to-cyan-100',
      text: 'Morning',
      emoji: '🌄',
    },
    day: {
      period: 'day',
      background: 'from-sky-200 via-blue-100 to-cyan-200',
      text: 'Day',
      emoji: '☀️',
    },
    afternoon: {
      period: 'afternoon',
      background: 'from-amber-100 via-yellow-50 to-orange-100',
      text: 'Afternoon',
      emoji: '🌞',
    },
    evening: {
      period: 'evening',
      background: 'from-orange-200 via-rose-100 to-pink-200',
      text: 'Evening',
      emoji: '🌇',
    },
    dusk: {
      period: 'dusk',
      background: 'from-purple-200 via-pink-200 to-indigo-200',
      text: 'Dusk',
      emoji: '🌆',
    },
    night: {
      period: 'night',
      background: 'from-slate-700 via-slate-800 to-slate-900',
      text: 'Night',
      emoji: '🌙',
    },
  };

  return themes[period];
}

/**
 * Check if it's currently daytime (between sunrise and sunset)
 */
export function isDaytime(sunrise?: Date, sunset?: Date, now: Date = new Date()): boolean {
  if (!sunrise || !sunset) {
    // Fallback: assume daytime between 6am and 8pm
    const hour = now.getHours();
    return hour >= 6 && hour < 20;
  }

  const currentTime = now.getTime();
  return currentTime >= sunrise.getTime() && currentTime <= sunset.getTime();
}

