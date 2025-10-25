/**
 * Weekly Beach Forecast API
 * Returns daily beach scores for the next 7 days
 */

import { NextRequest, NextResponse } from 'next/server';
import beaches from '@/data/beaches.json';
import { Beach } from '@/lib/models/beach';
import { ConditionSnapshot } from '@/lib/models/conditions';
import { getCurrentWeather } from '@/lib/services/weather.service';
import { getTideData } from '@/lib/services/tides.service';
import { getUVIndex } from '@/lib/services/uv.service';
import { calculateBeachScore } from '@/lib/scoring/beach-score';

export const runtime = 'edge';

interface DailyForecast {
  date: Date;
  dayName: string;
  score: number;
  highTemp: number;
  lowTemp: number;
  uvIndex: number;
  windSpeed: number;
  weatherDescription: string;
  weatherCode: string;
  sunrise: Date;
  sunset: Date;
  badges: Array<{ id: string; label: string; icon: string; type: string }>;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const beachId = searchParams.get('beachId');

  if (!beachId) {
    return NextResponse.json(
      { error: 'Beach ID is required' },
      { status: 400 }
    );
  }

  const beach = (beaches as Beach[]).find((b) => b.id === beachId);

  if (!beach) {
    return NextResponse.json(
      { error: 'Beach not found' },
      { status: 404 }
    );
  }

  try {
    // Fetch daily forecast from One Call API 3.0 (includes 8 days)
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${beach.lat}&lon=${beach.lon}&appid=${API_KEY}&units=imperial&exclude=minutely,hourly,alerts`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      // Return mock data if API fails
      return NextResponse.json({ 
        forecast: getMockWeeklyForecast(),
        beach 
      });
    }

    const data = await response.json();
    const dailyData = data.daily || [];

    // Get current UV and tide for reference (used for today)
    const [currentUV, tideData] = await Promise.all([
      getUVIndex(beach.lat, beach.lon),
      getTideData(beach.noaaStationId),
    ]);

    const forecast: DailyForecast[] = dailyData.slice(0, 7).map((day: any, index: number) => {
      // Create a representative snapshot for the day (using afternoon conditions)
      const snapshot: ConditionSnapshot = {
        timestamp: new Date(day.dt * 1000),
        beach: beach.id,
        temp: day.temp.day,
        feelsLike: day.feels_like.day,
        humidity: day.humidity,
        cloudCover: day.clouds,
        weatherDescription: day.weather[0].description,
        weatherCode: day.weather[0].icon,
        windSpeed: Math.round(day.wind_speed),
        windGust: day.wind_gust ? Math.round(day.wind_gust) : undefined,
        windDirection: day.wind_deg,
        uvIndex: day.uvi,
        uvMax: day.uvi,
        tideHeight: tideData.currentHeight,
        tideType: tideData.tideType,
        sunrise: new Date(day.sunrise * 1000),
        sunset: new Date(day.sunset * 1000),
        sunExposure: 100 - day.clouds,
      };

      // Calculate score for the day
      const scored = calculateBeachScore(snapshot);

      const date = new Date(day.dt * 1000);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      return {
        date,
        dayName: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : dayNames[date.getDay()],
        score: scored.window.score,
        highTemp: Math.round(day.temp.max),
        lowTemp: Math.round(day.temp.min),
        uvIndex: day.uvi,
        windSpeed: Math.round(day.wind_speed),
        weatherDescription: day.weather[0].description,
        weatherCode: day.weather[0].icon,
        sunrise: new Date(day.sunrise * 1000),
        sunset: new Date(day.sunset * 1000),
        badges: scored.window.badges.slice(0, 3), // Top 3 badges only
      };
    });

    return NextResponse.json({ forecast, beach }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Error fetching weekly forecast:', error);
    return NextResponse.json(
      { forecast: getMockWeeklyForecast(), beach },
      { status: 200 }
    );
  }
}

function getMockWeeklyForecast(): DailyForecast[] {
  const forecast: DailyForecast[] = [];
  const dayNames = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const now = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    date.setHours(14, 0, 0, 0);

    const sunrise = new Date(date);
    sunrise.setHours(6, 45, 0, 0);
    const sunset = new Date(date);
    sunset.setHours(19, 30, 0, 0);

    forecast.push({
      date,
      dayName: dayNames[i],
      score: 85 - i * 3,
      highTemp: 84 - i,
      lowTemp: 72 + i,
      uvIndex: 6 - i * 0.5,
      windSpeed: 8 + i,
      weatherDescription: i < 3 ? 'clear sky' : 'few clouds',
      weatherCode: i < 3 ? '01d' : '02d',
      sunrise,
      sunset,
      badges: [
        { id: 'temp-perfect', label: 'Perfect temp', icon: '🌡️', type: 'positive' },
        { id: 'uv-moderate', label: 'Bring sunscreen', icon: '🧴', type: 'neutral' },
      ],
    });
  }

  return forecast;
}

