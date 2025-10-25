/**
 * Plan API Route
 * Generates a complete beach trip plan with checklist
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNearbyPlaces } from '@/lib/services/places.service';
import { ChecklistItem } from '@/lib/models/plan';
import beaches from '@/data/beaches.json';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { beachId, windowStart, windowEnd, conditions } = body;

    if (!beachId || !windowStart || !conditions) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
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

    // Calculate departure time (30 min before window)
    const windowStartTime = new Date(windowStart);
    const departureTime = new Date(windowStartTime.getTime() - 30 * 60 * 1000);

    // Generate smart checklist based on conditions
    const checklist = generateChecklist(conditions);

    // Get nearby places
    const nearbyPlaces = await getNearbyPlaces(beach.lat, beach.lon);

    // Create plan
    const plan = {
      id: `plan-${Date.now()}`,
      beach,
      window: {
        id: `window-${Date.now()}`,
        startTime: windowStartTime,
        endTime: new Date(windowEnd),
        score: 0, // Score not available in this context
        badges: [],
        conditions,
        isGoNow: false,
      },
      departureTime,
      arrivalTime: windowStartTime,
      checklist,
      nearbyPlaces: nearbyPlaces.slice(0, 10), // Top 10 places
      parkingTips: beach.parking.notes || 'Check parking availability',
      createdAt: new Date(),
    };

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}

/**
 * Generate smart checklist based on conditions
 */
function generateChecklist(conditions: { uvIndex?: number; temp?: number; windSpeed?: number }): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  let itemId = 1;

  // Beach Essentials
  items.push(
    {
      id: `item-${itemId++}`,
      category: 'essentials',
      item: 'Beach towels',
      priority: 'essential',
      checked: false,
    },
    {
      id: `item-${itemId++}`,
      category: 'essentials',
      item: 'Beach umbrella or tent',
      priority: 'recommended',
      checked: false,
    },
    {
      id: `item-${itemId++}`,
      category: 'essentials',
      item: 'Beach chairs',
      priority: 'optional',
      checked: false,
    }
  );

  // Sun Protection
  const uvIndex = conditions.uvIndex || 5;
  const spf = uvIndex >= 8 ? 'SPF 50+' : uvIndex >= 6 ? 'SPF 30+' : 'SPF 30';
  
  items.push(
    {
      id: `item-${itemId++}`,
      category: 'sun-protection',
      item: `Sunscreen (${spf})`,
      reason: uvIndex >= 8 ? 'UV index is very high' : 'Protect from sun exposure',
      priority: 'essential',
      checked: false,
    },
    {
      id: `item-${itemId++}`,
      category: 'sun-protection',
      item: 'Hat or visor',
      priority: uvIndex >= 6 ? 'recommended' : 'optional',
      checked: false,
    },
    {
      id: `item-${itemId++}`,
      category: 'sun-protection',
      item: 'Sunglasses (UV protection)',
      priority: 'recommended',
      checked: false,
    }
  );

  // Hydration
  const temp = conditions.temp || 80;
  const waterBottles = temp >= 85 ? '3+ bottles' : '2+ bottles';
  
  items.push(
    {
      id: `item-${itemId++}`,
      category: 'hydration',
      item: `Water (${waterBottles})`,
      reason: temp >= 90 ? 'Very hot - stay hydrated' : 'Stay hydrated',
      priority: 'essential',
      checked: false,
    },
    {
      id: `item-${itemId++}`,
      category: 'hydration',
      item: 'Cooler with ice',
      priority: temp >= 85 ? 'recommended' : 'optional',
      checked: false,
    }
  );

  // Comfort items based on conditions
  const windSpeed = conditions.windSpeed || 0;
  if (windSpeed >= 15) {
    items.push({
      id: `item-${itemId++}`,
      category: 'comfort',
      item: 'Windbreaker or light jacket',
      reason: 'Windy conditions',
      priority: 'recommended',
      checked: false,
    });
  }

  if (temp < 75) {
    items.push({
      id: `item-${itemId++}`,
      category: 'comfort',
      item: 'Extra layer or sweatshirt',
      reason: 'Cooler temperatures',
      priority: 'recommended',
      checked: false,
    });
  }

  // Safety
  items.push(
    {
      id: `item-${itemId++}`,
      category: 'safety',
      item: 'First aid kit',
      priority: 'recommended',
      checked: false,
    },
    {
      id: `item-${itemId++}`,
      category: 'safety',
      item: 'Phone in waterproof case',
      priority: 'essential',
      checked: false,
    }
  );

  // Fun items
  items.push(
    {
      id: `item-${itemId++}`,
      category: 'fun',
      item: 'Beach toys or games',
      priority: 'optional',
      checked: false,
    },
    {
      id: `item-${itemId++}`,
      category: 'fun',
      item: 'Snorkel gear',
      priority: 'optional',
      checked: false,
    },
    {
      id: `item-${itemId++}`,
      category: 'fun',
      item: 'Camera or GoPro',
      priority: 'optional',
      checked: false,
    },
    {
      id: `item-${itemId++}`,
      category: 'fun',
      item: 'Book or magazine',
      priority: 'optional',
      checked: false,
    }
  );

  return items;
}

