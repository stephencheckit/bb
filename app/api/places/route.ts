/**
 * Places API Route
 * Returns nearby restaurants, cafes, and bars
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNearbyPlaces } from '@/lib/services/places.service';
import beaches from '@/data/beaches.json';

export const runtime = 'edge';
export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const beachId = searchParams.get('beachId');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const radius = searchParams.get('radius');

  // Use either beach ID or coordinates
  let latitude: number;
  let longitude: number;

  if (beachId) {
    const beach = beaches.find((b) => b.id === beachId);
    if (!beach) {
      return NextResponse.json(
        { error: 'Beach not found' },
        { status: 404 }
      );
    }
    latitude = beach.lat;
    longitude = beach.lon;
  } else if (lat && lon) {
    latitude = parseFloat(lat);
    longitude = parseFloat(lon);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }
  } else {
    return NextResponse.json(
      { error: 'Beach ID or coordinates required' },
      { status: 400 }
    );
  }

  try {
    const searchRadius = radius ? parseInt(radius) : 1500;
    const places = await getNearbyPlaces(latitude, longitude, searchRadius);

    return NextResponse.json({ places }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Error fetching places:', error);
    return NextResponse.json(
      { error: 'Failed to fetch places' },
      { status: 500 }
    );
  }
}

