/**
 * Weather and environmental condition models
 */

export interface ConditionSnapshot {
  timestamp: Date;
  beach: string; // beach ID
  
  // Weather
  temp: number; // Fahrenheit
  feelsLike: number;
  humidity: number; // percentage
  cloudCover: number; // percentage
  weatherDescription: string;
  weatherCode: string; // e.g., '01d' for clear sky
  
  // Wind
  windSpeed: number; // mph
  windGust?: number; // mph
  windDirection?: number; // degrees
  
  // UV
  uvIndex: number;
  uvMax?: number; // max for the day
  
  // Tide
  tideHeight: number; // feet
  tideType: TideType;
  nextTideEvent?: TideEvent;
  
  // Sun
  sunrise?: Date;
  sunset?: Date;
  sunExposure?: number; // 0-100, how sunny (inverse of cloud cover)
}

export type TideType = 'high' | 'low' | 'rising' | 'falling' | 'slack';

export interface TideEvent {
  time: Date;
  type: 'high' | 'low';
  height: number; // feet
}

export interface Window {
  id: string;
  startTime: Date;
  endTime: Date;
  score: number; // 0-100
  badges: Badge[];
  conditions: ConditionSnapshot;
  isGoNow: boolean;
}

export interface Badge {
  id: string;
  label: string;
  icon: string; // emoji
  type: 'positive' | 'neutral' | 'warning' | 'negative';
}

export interface ScoredWindow {
  window: Window;
  scoreBreakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  tempScore: number;
  uvScore: number;
  windScore: number;
  tideScore: number;
  weatherScore: number;
  totalScore: number;
  weights: ScoreWeights;
}

export interface ScoreWeights {
  temp: number;
  uv: number;
  wind: number;
  tide: number;
  weather: number;
}

