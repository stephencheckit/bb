'use client';

import { getScoreRange } from '@/lib/scoring/weights';
import Link from 'next/link';

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

interface BestDayCardProps {
  day: DailyForecast;
  beachId: string;
}

export function BestDayCard({ day, beachId }: BestDayCardProps) {
  const scoreRange = getScoreRange(day.score);
  
  // Color mapping
  const colorClasses: Record<string, string> = {
    emerald: 'from-emerald-500 to-teal-500 ring-emerald-200',
    sky: 'from-sky-500 to-blue-500 ring-sky-200',
    blue: 'from-blue-500 to-indigo-500 ring-blue-200',
    amber: 'from-amber-500 to-yellow-500 ring-amber-200',
    orange: 'from-orange-500 to-amber-600 ring-orange-200',
    red: 'from-red-500 to-rose-600 ring-red-200',
  };

  const gradientClass = colorClasses[scoreRange.color] || colorClasses.blue;

  const weatherEmoji = 
    day.weatherCode.startsWith('01') ? '☀️' :
    day.weatherCode.startsWith('02') ? '⛅' :
    day.weatherCode.startsWith('03') ? '☁️' :
    day.weatherCode.startsWith('04') ? '☁️' :
    day.weatherCode.startsWith('09') ? '🌧️' :
    day.weatherCode.startsWith('10') ? '🌦️' :
    day.weatherCode.startsWith('11') ? '⛈️' :
    day.weatherCode.startsWith('13') ? '❄️' : '🌤️';

  // Format date
  const dateObj = new Date(day.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Best Upcoming Beach Day
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {day.dayName} • {formattedDate}
          </p>
        </div>
        <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${gradientClass} ring-4`}>
          <span className="text-3xl font-bold text-white">{day.score}</span>
        </div>
      </div>

      {/* Verdict */}
      <div className="mb-4 rounded-lg bg-slate-50 p-4">
        <p className="text-center text-xl font-bold text-slate-900">
          {scoreRange.verdict}
        </p>
        <p className="mt-1 text-center text-sm text-slate-600">
          {scoreRange.label}
        </p>
      </div>

      {/* Weather Details */}
      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="text-center">
          <p className="text-2xl">{weatherEmoji}</p>
          <p className="mt-1 text-xs capitalize text-slate-600">{day.weatherDescription}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">{day.highTemp}°F</p>
          <p className="text-xs text-slate-500">High</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">UV {day.uvIndex.toFixed(1)}</p>
          <p className="text-xs text-slate-500">UV Index</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">{day.windSpeed} mph</p>
          <p className="text-xs text-slate-500">Wind</p>
        </div>
      </div>

      {/* Badges */}
      {day.badges.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {day.badges.slice(0, 4).map((badge) => (
            <span
              key={badge.id}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
            >
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </span>
          ))}
        </div>
      )}

      {/* Pack List Button */}
      <Link
        href={`/plan?beachId=${beachId}&date=${dateObj.toISOString()}`}
        className="block w-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 py-3 text-center font-bold text-white shadow-md transition-all hover:shadow-lg hover:from-sky-600 hover:to-blue-700"
      >
        📋 View Pack List & Details
      </Link>
    </div>
  );
}

