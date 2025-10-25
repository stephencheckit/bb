/**
 * NOAA Tides & Currents API Service
 * Fetches tide predictions and current water levels
 */

const BASE_URL = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';

export interface TideData {
  currentHeight: number; // feet
  tideType: 'high' | 'low' | 'rising' | 'falling' | 'slack';
  nextHigh?: TideEvent;
  nextLow?: TideEvent;
  timestamp: Date;
}

export interface TideEvent {
  time: Date;
  type: 'high' | 'low';
  height: number; // feet
}

/**
 * Get current tide data and predictions
 */
export async function getTideData(
  stationId: string,
  date: Date = new Date()
): Promise<TideData> {
  try {
    // Get current water level
    const waterLevel = await getCurrentWaterLevel(stationId);
    
    // Get tide predictions for today
    const predictions = await getTidePredictions(stationId, date);
    
    // Determine tide type
    const tideType = determineTideType(waterLevel, predictions);
    
    // Find next high and low tides
    const now = new Date();
    const nextHigh = predictions.find(p => p.type === 'high' && p.time > now);
    const nextLow = predictions.find(p => p.type === 'low' && p.time > now);

    return {
      currentHeight: waterLevel,
      tideType,
      nextHigh,
      nextLow,
      timestamp: now,
    };
  } catch (error) {
    console.error('Error fetching tide data:', error);
    throw error;
  }
}

/**
 * Get current water level from NOAA station
 */
async function getCurrentWaterLevel(stationId: string): Promise<number> {
  const now = new Date();
  const begin = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
  
  const params = new URLSearchParams({
    station: stationId,
    begin_date: formatNOAADate(begin),
    end_date: formatNOAADate(now),
    product: 'water_level',
    datum: 'MLLW',
    units: 'english',
    time_zone: 'lst_ldt',
    format: 'json',
  });

  const url = `${BASE_URL}?${params}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`NOAA API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      throw new Error('No water level data available');
    }

    // Get most recent reading
    const latest = data.data[data.data.length - 1];
    return parseFloat(latest.v);
  } catch (error) {
    console.error('Error fetching water level:', error);
    // Return fallback value
    return 0;
  }
}

/**
 * Get tide predictions (high/low tides) for a given date
 */
async function getTidePredictions(
  stationId: string,
  date: Date
): Promise<TideEvent[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const params = new URLSearchParams({
    station: stationId,
    begin_date: formatNOAADate(startOfDay),
    end_date: formatNOAADate(endOfDay),
    product: 'predictions',
    datum: 'MLLW',
    interval: 'hilo',
    units: 'english',
    time_zone: 'lst_ldt',
    format: 'json',
  });

  const url = `${BASE_URL}?${params}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`NOAA API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.predictions || data.predictions.length === 0) {
      return [];
    }

    return data.predictions.map((pred: { t: string; type: string; v: string }) => ({
      time: new Date(pred.t),
      type: pred.type === 'H' ? 'high' : 'low',
      height: parseFloat(pred.v),
    }));
  } catch (error) {
    console.error('Error fetching tide predictions:', error);
    return [];
  }
}

/**
 * Determine current tide type based on water level and predictions
 */
function determineTideType(
  currentHeight: number,
  predictions: TideEvent[]
): 'high' | 'low' | 'rising' | 'falling' | 'slack' {
  if (predictions.length < 2) {
    return 'slack';
  }

  const now = new Date();
  
  // Find surrounding tide events
  let previousTide: TideEvent | undefined;
  let nextTide: TideEvent | undefined;

  for (let i = 0; i < predictions.length; i++) {
    if (predictions[i].time > now) {
      nextTide = predictions[i];
      previousTide = i > 0 ? predictions[i - 1] : undefined;
      break;
    }
  }

  if (!previousTide || !nextTide) {
    return 'slack';
  }

  // Calculate if tide is rising or falling
  const isRising = nextTide.type === 'high';
  
  // Calculate how far through the tide cycle we are
  const totalDuration = nextTide.time.getTime() - previousTide.time.getTime();
  const elapsed = now.getTime() - previousTide.time.getTime();
  const progress = elapsed / totalDuration;

  // If we're within 15% of either end, it's slack tide
  if (progress < 0.15 || progress > 0.85) {
    return 'slack';
  }

  return isRising ? 'rising' : 'falling';
}

/**
 * Format date for NOAA API (YYYYMMDD HH:MM)
 */
function formatNOAADate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}${month}${day} ${hours}:${minutes}`;
}

/**
 * Get next tide events (convenience function)
 */
export async function getNextTideEvents(stationId: string): Promise<{
  nextHigh?: TideEvent;
  nextLow?: TideEvent;
}> {
  const tideData = await getTideData(stationId);
  return {
    nextHigh: tideData.nextHigh,
    nextLow: tideData.nextLow,
  };
}

