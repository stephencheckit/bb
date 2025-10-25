/**
 * OpenUV API Service
 * Fetches UV index data and forecasts
 */

const API_KEY = process.env.OPENUV_API_KEY;
const BASE_URL = 'https://api.openuv.io/api/v1';

export interface UVData {
  uvIndex: number;
  uvMax: number;
  safeExposureTime?: {
    st1?: number; // minutes for skin type 1
    st2?: number;
    st3?: number;
    st4?: number;
    st5?: number;
    st6?: number;
  };
  timestamp: Date;
}

export interface UVForecast {
  hourly: Array<{
    time: Date;
    uvIndex: number;
  }>;
}

/**
 * Get current UV index
 */
export async function getUVIndex(
  lat: number,
  lon: number,
  time?: Date
): Promise<UVData> {
  if (!API_KEY) {
    console.warn('⚠️ Using mock UV data - API key not configured');
    return getFallbackUVData(time || new Date());
  }

  const url = `${BASE_URL}/uv?lat=${lat}&lng=${lon}`;

  try {
    const response = await fetch(url, {
      headers: {
        'x-access-token': API_KEY,
      },
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!response.ok) {
      console.warn('⚠️ Using mock UV data - API error:', response.status);
      return getFallbackUVData(time || new Date());
    }

    const data = await response.json();
    const result = data.result;

    return {
      uvIndex: Math.round(result.uv * 10) / 10,
      uvMax: Math.round(result.uv_max * 10) / 10,
      safeExposureTime: result.safe_exposure_time,
      timestamp: new Date(result.uv_time),
    };
  } catch (error) {
    console.warn('⚠️ Using mock UV data - API error:', error);
    // Return fallback UV data based on time of day
    return getFallbackUVData(time || new Date());
  }
}

/**
 * Get UV forecast for the day
 */
export async function getUVForecast(
  lat: number,
  lon: number
): Promise<UVForecast> {
  if (!API_KEY) {
    throw new Error('OpenUV API key not configured');
  }

  const url = `${BASE_URL}/forecast?lat=${lat}&lng=${lon}`;

  try {
    const response = await fetch(url, {
      headers: {
        'x-access-token': API_KEY,
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`OpenUV API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.result;

    const hourly = result.map((item: { uv_time: string; uv: number }) => ({
      time: new Date(item.uv_time),
      uvIndex: Math.round(item.uv * 10) / 10,
    }));

    return { hourly };
  } catch (error) {
    console.error('Error fetching UV forecast:', error);
    // Return fallback forecast
    return { hourly: [] };
  }
}

/**
 * Fallback UV data estimation based on time of day
 * Used when API is unavailable or rate limited
 */
function getFallbackUVData(time: Date): UVData {
  const hour = time.getHours();
  
  // Simple estimation: UV peaks at noon, low at sunrise/sunset
  let estimatedUV = 0;
  
  if (hour >= 6 && hour <= 19) {
    // Daytime hours - realistic Florida UV levels
    const minutesSinceSunrise = (hour - 6) * 60;
    const minutesOfDaylight = 13 * 60;
    const progress = minutesSinceSunrise / minutesOfDaylight;
    
    // Bell curve peaking at noon (progress = 0.5)
    // Florida typically has UV 8-10 at peak
    estimatedUV = 9 * Math.sin(progress * Math.PI);
  }

  return {
    uvIndex: Math.round(estimatedUV * 10) / 10,
    uvMax: 9, // Typical Florida max
    timestamp: time,
  };
}

/**
 * Get UV safety level description
 */
export function getUVSafetyLevel(uvIndex: number): {
  level: 'low' | 'moderate' | 'high' | 'very-high' | 'extreme';
  description: string;
  recommendation: string;
} {
  if (uvIndex <= 2) {
    return {
      level: 'low',
      description: 'Low',
      recommendation: 'No protection needed',
    };
  } else if (uvIndex <= 5) {
    return {
      level: 'moderate',
      description: 'Moderate',
      recommendation: 'Seek shade during midday. Wear sunscreen',
    };
  } else if (uvIndex <= 7) {
    return {
      level: 'high',
      description: 'High',
      recommendation: 'Reduce sun exposure 10am-4pm. Use sunscreen SPF 30+',
    };
  } else if (uvIndex <= 10) {
    return {
      level: 'very-high',
      description: 'Very High',
      recommendation: 'Minimize sun exposure. Use SPF 50+ sunscreen',
    };
  } else {
    return {
      level: 'extreme',
      description: 'Extreme',
      recommendation: 'Avoid sun exposure. Take all precautions',
    };
  }
}

