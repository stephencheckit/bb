/**
 * OpenWeather API Service
 * Fetches current weather and hourly forecasts using One Call API 3.0
 */

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/3.0/onecall';

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
  sunrise?: Date;
  sunset?: Date;
  sunExposure?: number; // 0-100, how sunny
}

export interface HourlyForecast {
  forecasts: WeatherData[];
}

/**
 * Get current weather conditions using One Call API 3.0
 */
export async function getCurrentWeather(
  lat: number,
  lon: number
): Promise<WeatherData> {
  if (!API_KEY) {
    console.warn('⚠️ Using mock weather data - API key not configured');
    return getMockWeatherData();
  }

  const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 900 }, // Cache for 15 minutes
    });

    if (!response.ok) {
      console.warn('⚠️ Using mock weather data - API error:', response.status);
      return getMockWeatherData();
    }

    const data = await response.json();
    const current = data.current;

    return {
      temp: Math.round(current.temp),
      feelsLike: Math.round(current.feels_like),
      humidity: current.humidity,
      cloudCover: current.clouds,
      windSpeed: Math.round(current.wind_speed),
      windGust: current.wind_gust ? Math.round(current.wind_gust) : undefined,
      windDirection: current.wind_deg,
      weatherDescription: current.weather[0].description,
      weatherCode: current.weather[0].icon,
      timestamp: new Date(current.dt * 1000),
      sunrise: data.current.sunrise ? new Date(data.current.sunrise * 1000) : undefined,
      sunset: data.current.sunset ? new Date(data.current.sunset * 1000) : undefined,
      sunExposure: 100 - current.clouds, // Inverse of cloud cover
    };
  } catch (error) {
    console.warn('⚠️ Using mock weather data - API error:', error);
    return getMockWeatherData();
  }
}

/**
 * Get hourly forecast for next 24 hours using One Call API 3.0
 */
export async function getHourlyForecast(
  lat: number,
  lon: number,
  hours: number = 24
): Promise<HourlyForecast> {
  if (!API_KEY) {
    console.warn('⚠️ Using mock forecast data - API key not configured');
    return getMockForecastData(hours);
  }

  // One Call API 3.0 gives us 48 hours of hourly forecast
  const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial&exclude=minutely,daily,alerts`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 900 }, // Cache for 15 minutes
    });

    if (!response.ok) {
      console.warn('⚠️ Using mock forecast data - API error:', response.status);
      return getMockForecastData(hours);
    }

    const data = await response.json();
    
    // One Call 3.0 gives us hourly data (48 hours) and daily data
    // We'll take every 3rd hour to match our 3-hour window system
    const hourlyData = data.hourly || [];
    const dailyData = data.daily || [];
    const forecasts: WeatherData[] = [];
    
    for (let i = 0; i < Math.min(hours, hourlyData.length); i += 3) {
      const item = hourlyData[i];
      const itemTime = new Date(item.dt * 1000);
      
      // Find the correct day's sunrise/sunset for this hour
      const dayData = dailyData.find((day: { dt: number }) => {
        const dayDate = new Date(day.dt * 1000);
        return dayDate.toDateString() === itemTime.toDateString();
      }) || dailyData[0];
      
      forecasts.push({
        temp: Math.round(item.temp),
        feelsLike: Math.round(item.feels_like),
        humidity: item.humidity,
        cloudCover: item.clouds,
        windSpeed: Math.round(item.wind_speed),
        windGust: item.wind_gust ? Math.round(item.wind_gust) : undefined,
        windDirection: item.wind_deg,
        weatherDescription: item.weather[0].description,
        weatherCode: item.weather[0].icon,
        timestamp: itemTime,
        sunrise: dayData?.sunrise ? new Date(dayData.sunrise * 1000) : undefined,
        sunset: dayData?.sunset ? new Date(dayData.sunset * 1000) : undefined,
        sunExposure: 100 - item.clouds, // Inverse of cloud cover
      });
    }

    return { forecasts };
  } catch (error) {
    console.warn('⚠️ Using mock forecast data - API error:', error);
    return getMockForecastData(hours);
  }
}

/**
 * Mock weather data for testing (Perfect Florida beach day!)
 */
function getMockWeatherData(): WeatherData {
  const now = new Date();
  const sunrise = new Date(now);
  sunrise.setHours(6, 45, 0, 0);
  const sunset = new Date(now);
  sunset.setHours(19, 30, 0, 0);
  
  return {
    temp: 82,
    feelsLike: 85,
    humidity: 65,
    cloudCover: 20,
    windSpeed: 8,
    windGust: 12,
    windDirection: 180,
    weatherDescription: 'few clouds',
    weatherCode: '02d',
    timestamp: now,
    sunrise,
    sunset,
    sunExposure: 80, // 100 - 20 cloud cover
  };
}

/**
 * Mock forecast data for testing
 */
function getMockForecastData(hours: number): HourlyForecast {
  const forecasts: WeatherData[] = [];
  const now = new Date();
  
  // Generate forecast data for next several 3-hour blocks
  for (let i = 0; i < Math.min(hours / 3, 4); i++) {
    const timestamp = new Date(now.getTime() + i * 3 * 60 * 60 * 1000);
    const hour = timestamp.getHours();
    
    // Vary temperature throughout the day
    let temp = 82;
    if (hour < 9) temp = 76;
    else if (hour < 12) temp = 80;
    else if (hour < 15) temp = 85;
    else if (hour < 18) temp = 83;
    else temp = 78;
    
    const sunrise = new Date(now);
    sunrise.setHours(6, 45, 0, 0);
    const sunset = new Date(now);
    sunset.setHours(19, 30, 0, 0);
    const cloudCover = 15 + i * 10;
    
    forecasts.push({
      temp,
      feelsLike: temp + 3,
      humidity: 60 + i * 5,
      cloudCover,
      windSpeed: 7 + i,
      windGust: 10 + i * 2,
      windDirection: 180,
      weatherDescription: i === 0 ? 'clear sky' : 'few clouds',
      weatherCode: i === 0 ? '01d' : '02d',
      timestamp,
      sunrise,
      sunset,
      sunExposure: 100 - cloudCover,
    });
  }
  
  return { forecasts };
}

