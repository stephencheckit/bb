/**
 * Conditions API Route
 * Aggregates weather, tide, and UV data for a beach
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentWeather } from '@/lib/services/weather.service';
import { getTideData } from '@/lib/services/tides.service';
import { getUVIndex } from '@/lib/services/uv.service';
import { ConditionSnapshot } from '@/lib/models/conditions';
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
    // Fetch all data in parallel
    const [weather, tideData, uvData] = await Promise.all([
      getCurrentWeather(beach.lat, beach.lon),
      getTideData(beach.noaaStationId),
      getUVIndex(beach.lat, beach.lon),
    ]);

    // Create condition snapshot
    const conditions: ConditionSnapshot = {
      timestamp: new Date(),
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
      uvIndex: uvData.uvIndex,
      uvMax: uvData.uvMax,
      tideHeight: tideData.currentHeight,
      tideType: tideData.tideType,
      nextTideEvent: tideData.nextHigh || tideData.nextLow,
      sunrise: weather.sunrise,
      sunset: weather.sunset,
      sunExposure: weather.sunExposure,
    };

    return NextResponse.json({ conditions }, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    console.error('Error fetching conditions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conditions' },
      { status: 500 }
    );
  }
}

