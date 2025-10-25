/**
 * BeachScore calculation engine
 * Evaluates beach conditions and returns 0-100 score with explanations
 */

import { ConditionSnapshot, Badge, ScoredWindow, ScoreBreakdown, Window } from '../models/conditions';
import { UserPreferences } from '../models/plan';
import {
  DEFAULT_WEIGHTS,
  TEMP_THRESHOLDS,
  UV_THRESHOLDS,
  WIND_THRESHOLDS,
  WEATHER_SCORES,
} from './weights';

/**
 * Calculate comprehensive beach score
 */
export function calculateBeachScore(
  conditions: ConditionSnapshot,
  preferences?: UserPreferences
): ScoredWindow {
  // Use user preferences or defaults
  const weights = preferences ? customizeWeights(preferences) : DEFAULT_WEIGHTS;

  // Calculate individual scores
  const tempScore = calculateTempScore(conditions.temp, conditions.feelsLike, preferences);
  const uvScore = calculateUVScore(conditions.uvIndex);
  const windScore = calculateWindScore(conditions.windSpeed, conditions.windGust);
  const tideScore = calculateTideScore(conditions.tideType);
  const weatherScore = calculateWeatherScore(conditions.weatherCode, conditions.cloudCover);

  // Calculate weighted total
  const totalScore = Math.round(
    tempScore * weights.temp +
    uvScore * weights.uv +
    windScore * weights.wind +
    tideScore * weights.tide +
    weatherScore * weights.weather
  );

  // Generate badges (explanations)
  const badges = generateBadges(conditions, {
    tempScore,
    uvScore,
    windScore,
    tideScore,
    weatherScore,
    totalScore,
    weights,
  });

  // Create window object
  const window: Window = {
    id: `window-${conditions.timestamp.getTime()}`,
    startTime: conditions.timestamp,
    endTime: new Date(conditions.timestamp.getTime() + 3 * 60 * 60 * 1000), // +3 hours
    score: totalScore,
    badges,
    conditions,
    isGoNow: false, // Will be set by window generator
  };

  const scoreBreakdown: ScoreBreakdown = {
    tempScore,
    uvScore,
    windScore,
    tideScore,
    weatherScore,
    totalScore,
    weights,
  };

  return { window, scoreBreakdown };
}

/**
 * Temperature score: Bell curve peaking at 80-90°F
 */
function calculateTempScore(temp: number, feelsLike: number, preferences?: UserPreferences): number {
  // Use feels-like temp for scoring
  const effectiveTemp = feelsLike;

  // Check user preferences
  if (preferences?.tempRange) {
    const { min, max } = preferences.tempRange;
    const mid = (min + max) / 2;
    const range = max - min;

    if (effectiveTemp >= min && effectiveTemp <= max) {
      // Within user's range, score based on proximity to mid
      const deviation = Math.abs(effectiveTemp - mid);
      return 100 - (deviation / (range / 2)) * 20;
    } else if (effectiveTemp < min) {
      // Below user's range
      const diff = min - effectiveTemp;
      return Math.max(0, 80 - diff * 10);
    } else {
      // Above user's range
      const diff = effectiveTemp - max;
      return Math.max(0, 80 - diff * 10);
    }
  }

  // Default scoring
  if (effectiveTemp >= TEMP_THRESHOLDS.optimal.min && effectiveTemp <= TEMP_THRESHOLDS.optimal.max) {
    return 100;
  } else if (effectiveTemp >= TEMP_THRESHOLDS.good.min && effectiveTemp <= TEMP_THRESHOLDS.good.max) {
    // Linear interpolation in good range
    if (effectiveTemp < TEMP_THRESHOLDS.optimal.min) {
      const diff = TEMP_THRESHOLDS.optimal.min - effectiveTemp;
      return 100 - diff * 2;
    } else {
      const diff = effectiveTemp - TEMP_THRESHOLDS.optimal.max;
      return 100 - diff * 2;
    }
  } else if (effectiveTemp >= TEMP_THRESHOLDS.acceptable.min && effectiveTemp <= TEMP_THRESHOLDS.acceptable.max) {
    return effectiveTemp < TEMP_THRESHOLDS.good.min ? 70 : 70;
  } else if (effectiveTemp >= TEMP_THRESHOLDS.poor.min && effectiveTemp <= TEMP_THRESHOLDS.poor.max) {
    return 40;
  } else {
    return 20;
  }
}

/**
 * UV score: Lower is better for safety
 */
function calculateUVScore(uvIndex: number): number {
  if (uvIndex <= UV_THRESHOLDS.low) {
    return 100;
  } else if (uvIndex <= UV_THRESHOLDS.moderate) {
    return 80;
  } else if (uvIndex <= UV_THRESHOLDS.high) {
    return 60;
  } else if (uvIndex <= UV_THRESHOLDS.veryHigh) {
    return 40;
  } else {
    return 20;
  }
}

/**
 * Wind score: Lower is better for comfort
 */
function calculateWindScore(windSpeed: number, windGust?: number, preferences?: UserPreferences): number {
  // Use gust if significantly higher
  const effectiveWind = windGust && windGust > windSpeed + 5 ? windGust : windSpeed;

  // Check user wind tolerance
  const maxTolerable = preferences?.windTolerance || WIND_THRESHOLDS.strong;

  if (effectiveWind > maxTolerable) {
    return 20;
  }

  if (effectiveWind < WIND_THRESHOLDS.calm) {
    return 100;
  } else if (effectiveWind < WIND_THRESHOLDS.light) {
    return 90;
  } else if (effectiveWind < WIND_THRESHOLDS.moderate) {
    return 70;
  } else if (effectiveWind < WIND_THRESHOLDS.fresh) {
    return 50;
  } else if (effectiveWind < WIND_THRESHOLDS.strong) {
    return 30;
  } else {
    return 20;
  }
}

/**
 * Tide score: Slack and low tides preferred
 */
function calculateTideScore(tideType: string): number {
  switch (tideType) {
    case 'slack':
      return 100;
    case 'low':
      return 90;
    case 'rising':
    case 'falling':
      return 80;
    case 'high':
      return 70;
    default:
      return 80;
  }
}

/**
 * Weather score: Clear > Cloudy > Rain
 */
function calculateWeatherScore(weatherCode: string, cloudCover: number): number {
  const baseScore = WEATHER_SCORES[weatherCode] || 50;

  // Adjust based on cloud cover
  if (cloudCover > 75 && baseScore > 70) {
    return baseScore - 10;
  }

  return baseScore;
}

/**
 * Generate badge explanations
 */
function generateBadges(conditions: ConditionSnapshot, breakdown: ScoreBreakdown): Badge[] {
  const badges: Badge[] = [];

  // Temperature badge
  if (breakdown.tempScore >= 90) {
    badges.push({
      id: 'temp-perfect',
      label: 'Perfect temp',
      icon: '🌡️',
      type: 'positive',
    });
  } else if (breakdown.tempScore < 50) {
    if (conditions.feelsLike < 70) {
      badges.push({
        id: 'temp-cold',
        label: 'Cool weather',
        icon: '🥶',
        type: 'warning',
      });
    } else {
      badges.push({
        id: 'temp-hot',
        label: 'Very hot',
        icon: '🥵',
        type: 'warning',
      });
    }
  }

  // UV badge
  if (conditions.uvIndex <= 2) {
    badges.push({
      id: 'uv-low',
      label: 'Low UV',
      icon: '☀️',
      type: 'positive',
    });
  } else if (conditions.uvIndex >= 8) {
    badges.push({
      id: 'uv-high',
      label: 'High UV—SPF 50+',
      icon: '🧴',
      type: 'warning',
    });
  } else if (conditions.uvIndex >= 6) {
    badges.push({
      id: 'uv-moderate',
      label: 'Bring sunscreen',
      icon: '🧴',
      type: 'neutral',
    });
  }

  // Wind badge
  if (conditions.windSpeed < 5) {
    badges.push({
      id: 'wind-calm',
      label: 'Gentle breeze',
      icon: '🍃',
      type: 'positive',
    });
  } else if (conditions.windSpeed >= 15) {
    badges.push({
      id: 'wind-strong',
      label: conditions.windSpeed >= 20 ? 'Very windy' : 'Breezy',
      icon: '💨',
      type: 'warning',
    });
  }

  // Tide badge
  if (conditions.tideType === 'slack' || conditions.tideType === 'low') {
    badges.push({
      id: 'tide-good',
      label: conditions.tideType === 'slack' ? 'Slack tide' : 'Low tide',
      icon: '🌊',
      type: 'positive',
    });
  }

  // Weather badge
  if (conditions.weatherCode.startsWith('01') || conditions.weatherCode.startsWith('02')) {
    badges.push({
      id: 'weather-clear',
      label: 'Clear skies',
      icon: '☀️',
      type: 'positive',
    });
  } else if (conditions.weatherCode.startsWith('09') || conditions.weatherCode.startsWith('10')) {
    badges.push({
      id: 'weather-rain',
      label: 'Rain expected',
      icon: '🌧️',
      type: 'negative',
    });
  } else if (conditions.weatherCode.startsWith('11')) {
    badges.push({
      id: 'weather-storm',
      label: 'Thunderstorms',
      icon: '⛈️',
      type: 'negative',
    });
  }

  return badges;
}

/**
 * Customize weights based on user preferences
 */
function customizeWeights(preferences: UserPreferences) {
  // Start with defaults
  const weights = { ...DEFAULT_WEIGHTS };

  // Adjust based on activity goals
  if (preferences.activityGoals?.includes('photography')) {
    // Photographers care more about weather, less about UV
    weights.weather = 0.20;
    weights.uv = 0.15;
  }

  if (preferences.activityGoals?.includes('swim')) {
    // Swimmers care more about tide and temp
    weights.tide = 0.15;
    weights.temp = 0.35;
    weights.wind = 0.20;
  }

  // Normalize to sum to 1.0
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  Object.keys(weights).forEach((key) => {
    weights[key as keyof typeof weights] /= sum;
  });

  return weights;
}

/**
 * Explain why a score is what it is
 */
export function explainScore(breakdown: ScoreBreakdown): string {
  const explanations: string[] = [];

  if (breakdown.tempScore < 70) {
    explanations.push('Temperature is outside comfortable range');
  }
  if (breakdown.uvScore < 60) {
    explanations.push('UV index is high—extra sun protection needed');
  }
  if (breakdown.windScore < 60) {
    explanations.push('Wind conditions may be uncomfortable');
  }
  if (breakdown.weatherScore < 70) {
    explanations.push('Weather conditions are not ideal');
  }

  if (explanations.length === 0) {
    return 'All conditions are favorable!';
  }

  return explanations.join('. ') + '.';
}

