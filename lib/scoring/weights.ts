/**
 * BeachScore weights and thresholds
 * Configure scoring parameters here
 */

export interface ScoreWeights {
  temp: number;
  uv: number;
  wind: number;
  tide: number;
  weather: number;
}

// Default scoring weights (must sum to 1.0)
export const DEFAULT_WEIGHTS: ScoreWeights = {
  temp: 0.30,    // 30% - Temperature comfort
  uv: 0.25,      // 25% - UV safety
  wind: 0.25,    // 25% - Wind comfort
  tide: 0.10,    // 10% - Tide suitability
  weather: 0.10, // 10% - Weather conditions
};

// Temperature thresholds (Fahrenheit)
export const TEMP_THRESHOLDS = {
  optimal: { min: 80, max: 90 },    // Perfect range
  good: { min: 75, max: 95 },       // Good range
  acceptable: { min: 70, max: 98 }, // Acceptable range
  poor: { min: 65, max: 100 },      // Poor but tolerable
};

// UV Index thresholds
export const UV_THRESHOLDS = {
  low: 2,        // 0-2: No protection needed
  moderate: 5,   // 3-5: Some protection needed
  high: 7,       // 6-7: Protection required
  veryHigh: 10,  // 8-10: Extra protection required
  extreme: 11,   // 11+: Avoid if possible
};

// Wind speed thresholds (mph)
export const WIND_THRESHOLDS = {
  calm: 5,         // 0-5: Perfect
  light: 10,       // 5-10: Still great
  moderate: 15,    // 10-15: Noticeable
  fresh: 20,       // 15-20: Somewhat uncomfortable
  strong: 25,      // 20-25: Uncomfortable
  veryStrong: 30,  // 25+: Very uncomfortable
};

// Weather condition scores
export const WEATHER_SCORES: Record<string, number> = {
  // OpenWeather icon codes
  '01d': 100, // Clear sky day
  '01n': 100, // Clear sky night
  '02d': 90,  // Few clouds day
  '02n': 90,  // Few clouds night
  '03d': 80,  // Scattered clouds
  '03n': 80,
  '04d': 70,  // Broken clouds
  '04n': 70,
  '09d': 30,  // Shower rain
  '09n': 30,
  '10d': 20,  // Rain
  '10n': 20,
  '11d': 10,  // Thunderstorm
  '11n': 10,
  '13d': 40,  // Snow
  '13n': 40,
  '50d': 60,  // Mist/fog
  '50n': 60,
};

// Score range descriptions
export interface ScoreRange {
  min: number;
  max: number;
  label: string;
  verdict: string;
  color: string;
}

export const SCORE_RANGES: ScoreRange[] = [
  {
    min: 90,
    max: 100,
    label: 'Perfect',
    verdict: 'Go now! Perfect beach day!',
    color: 'emerald',
  },
  {
    min: 80,
    max: 89,
    label: 'Excellent',
    verdict: 'Go now! Excellent conditions.',
    color: 'sky',
  },
  {
    min: 70,
    max: 79,
    label: 'Good',
    verdict: 'Pretty good—bring sunscreen!',
    color: 'blue',
  },
  {
    min: 60,
    max: 69,
    label: 'Fair',
    verdict: 'Okay day, check conditions.',
    color: 'amber',
  },
  {
    min: 40,
    max: 59,
    label: 'Marginal',
    verdict: 'Not ideal, but doable.',
    color: 'orange',
  },
  {
    min: 0,
    max: 39,
    label: 'Poor',
    verdict: 'Maybe tomorrow?',
    color: 'red',
  },
];

/**
 * Get score range for a given score
 */
export function getScoreRange(score: number): ScoreRange {
  return (
    SCORE_RANGES.find((range) => score >= range.min && score <= range.max) ||
    SCORE_RANGES[SCORE_RANGES.length - 1]
  );
}

