'use client';

import { getScoreRange } from '@/lib/scoring/weights';

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

interface WeeklyForecastProps {
  forecast: DailyForecast[];
  beachName: string;
}

export function WeeklyForecast({ forecast, beachName }: WeeklyForecastProps) {
  // Color mapping for scores
  const getScoreColor = (score: number) => {
    const range = getScoreRange(score);
    const colors: Record<string, string> = {
      emerald: 'bg-emerald-500',
      sky: 'bg-sky-500',
      blue: 'bg-blue-500',
      amber: 'bg-amber-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
    };
    return colors[range.color] || colors.blue;
  };

  const getScoreRingColor = (score: number) => {
    const range = getScoreRange(score);
    const colors: Record<string, string> = {
      emerald: 'ring-emerald-200',
      sky: 'ring-sky-200',
      blue: 'ring-blue-200',
      amber: 'ring-amber-200',
      orange: 'ring-orange-200',
      red: 'ring-red-200',
    };
    return colors[range.color] || colors.blue;
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <h3 className="mb-4 text-lg font-bold text-slate-900">
        7-Day Beach Forecast
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {forecast.map((day, index) => {
          const scoreRange = getScoreRange(day.score);
          
          return (
            <div
              key={index}
              className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-slate-300 hover:shadow-md"
            >
              {/* Day Name */}
              <p className="mb-2 text-sm font-semibold text-slate-900">
                {day.dayName}
              </p>

              {/* Score Badge */}
              <div className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full ${getScoreColor(day.score)} ring-4 ${getScoreRingColor(day.score)}`}>
                <span className="text-2xl font-bold text-white">{day.score}</span>
              </div>

              {/* Weather Icon & Description */}
              <div className="mb-2 text-center">
                <p className="text-3xl">
                  {day.weatherCode.startsWith('01') ? '☀️' :
                   day.weatherCode.startsWith('02') ? '⛅' :
                   day.weatherCode.startsWith('03') ? '☁️' :
                   day.weatherCode.startsWith('04') ? '☁️' :
                   day.weatherCode.startsWith('09') ? '🌧️' :
                   day.weatherCode.startsWith('10') ? '🌦️' :
                   day.weatherCode.startsWith('11') ? '⛈️' :
                   day.weatherCode.startsWith('13') ? '❄️' : '🌤️'}
                </p>
                <p className="mt-1 text-xs capitalize text-slate-600">
                  {day.weatherDescription}
                </p>
              </div>

              {/* Temperature */}
              <div className="mb-2 text-center">
                <p className="text-lg font-bold text-slate-900">
                  {day.highTemp}°
                </p>
                <p className="text-xs text-slate-500">{day.lowTemp}°</p>
              </div>

              {/* Key Badge (if any) */}
              {day.badges.length > 0 && (
                <div className="mt-1 text-xs text-slate-600">
                  {day.badges[0].icon}
                </div>
              )}

              {/* Score Label */}
              <p className="mt-2 text-xs font-medium text-slate-500">
                {scoreRange.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 border-t border-slate-200 pt-4">
        <p className="text-xs text-slate-500">
          💡 Scores are based on afternoon conditions (temp, UV, wind, weather).
        </p>
      </div>
    </div>
  );
}

