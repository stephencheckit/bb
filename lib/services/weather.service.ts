/**
 * OpenWeather API Service
 * Fetches current weather and hourly forecasts
 */

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  temp: number; // Fahrenheit
  feelsLike: number;
  humidity: number; // percentage
  cloudCover: number; // percentage
  windSpeed: number; // mph
  windGust?: number;
  windDirection: number; // degrees
  weatherDescription: string;
  weatherCode: string;
  timestamp: Date;
}

export interface HourlyForecast {
  forecasts: WeatherData[];
}

/**
 * Get current weather conditions
 */
export async function getCurrentWeather(
  lat: number,
  lon: number
): Promise<WeatherData> {
  if (!API_KEY) {
    throw new Error('OpenWeather API key not configured');
  }

  const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 900 }, // Cache for 15 minutes
    });

    if (!response.ok) {
      throw new Error(`OpenWeather API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      cloudCover: data.clouds.all,
      windSpeed: Math.round(data.wind.speed),
      windGust: data.wind.gust ? Math.round(data.wind.gust) : undefined,
      windDirection: data.wind.deg,
      weatherDescription: data.weather[0].description,
      weatherCode: data.weather[0].icon,
      timestamp: new Date(data.dt * 1000),
    };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
}

/**
 * Get hourly forecast for next 24 hours
 */
export async function getHourlyForecast(
  lat: number,
  lon: number,
  hours: number = 24
): Promise<HourlyForecast> {
  if (!API_KEY) {
    throw new Error('OpenWeather API key not configured');
  }

  // Use the One Call API for hourly data
  const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial&cnt=${Math.min(hours / 3, 40)}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 900 }, // Cache for 15 minutes
    });

    if (!response.ok) {
      throw new Error(`OpenWeather API error: ${response.status}`);
    }

    const data = await response.json();

    const forecasts: WeatherData[] = data.list.map((item: { main: { temp: number; feels_like: number; humidity: number }; clouds: { all: number }; wind: { speed: number; gust?: number; deg: number }; weather: [{ description: string; icon: string }]; dt: number }) => ({
      temp: Math.round(item.main.temp),
      feelsLike: Math.round(item.main.feels_like),
      humidity: item.main.humidity,
      cloudCover: item.clouds.all,
      windSpeed: Math.round(item.wind.speed),
      windGust: item.wind.gust ? Math.round(item.wind.gust) : undefined,
      windDirection: item.wind.deg,
      weatherDescription: item.weather[0].description,
      weatherCode: item.weather[0].icon,
      timestamp: new Date(item.dt * 1000),
    }));

    return { forecasts };
  } catch (error) {
    console.error('Error fetching hourly forecast:', error);
    throw error;
  }
}

