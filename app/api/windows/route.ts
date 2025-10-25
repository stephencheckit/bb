/**
 * Windows API Route
 * Returns BeachScore time windows for a beach
 */

import { NextRequest, NextResponse } from 'next/server';
import { getHourlyForecast } from '@/lib/services/weather.service';
import { getTideData } from '@/lib/services/tides.service';
import { getUVIndex } from '@/lib/services/uv.service';
import { ConditionSnapshot } from '@/lib/models/conditions';
import { generateWindows } from '@/lib/scoring/windows';
import beaches from '@/data/beaches.json';

export const runtime = 'edge';
export const revalidate = 900; // Cache for 15 minutes

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const beachId = searchParams.get('beachId');

  if (!beachId) {
    return NextResponse.json(
      { error: 'Beach ID is required' },
      { status: 400 }
    );
  }

  // Find beach
  const beach = beaches.find((b) => b.id === beachId);

  if (!beach) {
    return NextResponse.json(
      { error: 'Beach not found' },
      { status: 404 }
    );
  }

  try {
    // Fetch hourly forecast and current tide
    const [forecastData, tideData, currentUV] = await Promise.all([
      getHourlyForecast(beach.lat, beach.lon, 12),
      getTideData(beach.noaaStationId),
      getUVIndex(beach.lat, beach.lon),
    ]);

    // Create condition snapshots for each forecast period
    const conditions: ConditionSnapshot[] = forecastData.forecasts.map((weather) => ({
      timestamp: weather.timestamp,
      beach: beach.id,
      temp: weather.temp,
      feelsLike: weather.feelsLike,
      humidity: weather.humidity,
      cloudCover: weather.cloudCover,
      weatherDescription: weather.weatherDescription,
      weatherCode: weather.weatherCode,
      windSpeed: weather.windSpeed,
      windGust: weather.windGust,
      windDirection: weather.windDirection,
      uvIndex: currentUV.uvIndex, // Use current UV (forecast would need different API)
      uvMax: currentUV.uvMax,
      tideHeight: tideData.currentHeight,
      tideType: tideData.tideType,
      nextTideEvent: tideData.nextHigh || tideData.nextLow,
    }));

    // Generate windows with scores
    const windows = await generateWindows(beach, conditions);

    return NextResponse.json({ windows, beach }, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    console.error('Error generating windows:', error);
    return NextResponse.json(
      { error: 'Failed to generate windows' },
      { status: 500 }
    );
  }
}

