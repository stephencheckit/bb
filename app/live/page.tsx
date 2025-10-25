'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import { Beach } from '@/lib/models/beach';
import { ConditionSnapshot } from '@/lib/models/conditions';
import { ConditionTile } from '@/components/condition-tile';
import { formatTemp, formatUV, formatWindSpeed, formatTideHeight, formatTime } from '@/lib/utils/formatters';
import { getUVSafetyLevel } from '@/lib/services/uv.service';
import beaches from '@/data/beaches.json';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function LiveContent() {
  const searchParams = useSearchParams();
  const beachId = searchParams.get('beachId') || beaches[0]?.id;

  // Fetch current conditions (refresh every 5 minutes)
  const { data, error, isLoading } = useSWR(
    beachId ? `/api/conditions?beachId=${beachId}` : null,
    fetcher,
    { refreshInterval: 300000 }
  );

  const beach = beaches.find((b: Beach) => b.id === beachId);
  const conditions: ConditionSnapshot | undefined = data?.conditions;

  if (!beach) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-slate-600">Beach not found</p>
          <Link href="/" className="mt-4 block text-center text-sky-500 hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <Link href="/" className="text-sm text-sky-500 hover:underline">
            ← Back to home
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Live Conditions
          </h1>
          <p className="mt-1 text-slate-600">{beach.name}</p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {isLoading && (
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-500 border-r-transparent"></div>
            <p className="mt-4 text-slate-600">Loading conditions...</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 p-6 text-center">
            <p className="text-red-700">Failed to load conditions</p>
          </div>
        )}

        {conditions && (
          <div className="space-y-8">
            {/* Current Status */}
            <section className="rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Right now</p>
                  <p className="mt-1 text-3xl font-bold capitalize">
                    {conditions.weatherDescription}
                  </p>
                  <p className="mt-1 text-sm opacity-75">
                    Updated {formatTime(new Date(conditions.timestamp))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-6xl font-bold">
                    {Math.round(conditions.temp)}°
                  </p>
                  <p className="mt-1 text-sm opacity-75">
                    Feels like {Math.round(conditions.feelsLike)}°
                  </p>
                </div>
              </div>
            </section>

            {/* Main Conditions Grid */}
            <section>
              <h2 className="mb-4 text-xl font-bold text-slate-900">
                Current Conditions
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <ConditionTile
                  icon="🌡️"
                  label="Temperature"
                  value={formatTemp(conditions.temp)}
                  status={
                    conditions.temp >= 80 && conditions.temp <= 90
                      ? 'safe'
                      : conditions.temp < 70 || conditions.temp > 95
                      ? 'danger'
                      : 'caution'
                  }
                  subtitle={`Feels like ${formatTemp(conditions.feelsLike)}`}
                />
                <ConditionTile
                  icon="☀️"
                  label="UV Index"
                  value={formatUV(conditions.uvIndex)}
                  status={
                    conditions.uvIndex <= 5
                      ? 'safe'
                      : conditions.uvIndex <= 7
                      ? 'caution'
                      : 'danger'
                  }
                  subtitle={getUVSafetyLevel(conditions.uvIndex).description}
                />
                <ConditionTile
                  icon="💨"
                  label="Wind Speed"
                  value={formatWindSpeed(conditions.windSpeed)}
                  status={
                    conditions.windSpeed < 10
                      ? 'safe'
                      : conditions.windSpeed < 20
                      ? 'caution'
                      : 'danger'
                  }
                  subtitle={conditions.windGust ? `Gusts ${conditions.windGust} mph` : 'Steady'}
                />
                <ConditionTile
                  icon="🌊"
                  label="Tide Height"
                  value={formatTideHeight(conditions.tideHeight)}
                  status="safe"
                  subtitle={conditions.tideType}
                />
                <ConditionTile
                  icon="💧"
                  label="Humidity"
                  value={`${conditions.humidity}%`}
                  status={conditions.humidity > 80 ? 'caution' : 'safe'}
                />
                <ConditionTile
                  icon="☁️"
                  label="Cloud Cover"
                  value={`${conditions.cloudCover}%`}
                  status="safe"
                />
              </div>
            </section>

            {/* Tide Information */}
            {conditions.nextTideEvent && (
              <section className="rounded-xl bg-blue-50 p-6 ring-1 ring-blue-200">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">🌊</span>
                  <div>
                    <p className="font-semibold text-blue-900">Next Tide</p>
                    <p className="mt-1 text-blue-800">
                      <span className="capitalize">{conditions.nextTideEvent.type}</span> tide at{' '}
                      {formatTime(new Date(conditions.nextTideEvent.time))}
                      {' '}({formatTideHeight(conditions.nextTideEvent.height)})
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Beach Facilities */}
            <section>
              <h2 className="mb-4 text-xl font-bold text-slate-900">
                Beach Facilities
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {beach.facilities.restroom && (
                  <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
                    <span className="text-2xl">🚻</span>
                    <p className="font-medium text-slate-900">Restrooms</p>
                  </div>
                )}
                {beach.facilities.shower && (
                  <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
                    <span className="text-2xl">🚿</span>
                    <p className="font-medium text-slate-900">Showers</p>
                  </div>
                )}
                {beach.facilities.lifeguard && (
                  <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
                    <span className="text-2xl">🏊</span>
                    <p className="font-medium text-slate-900">Lifeguard on Duty</p>
                  </div>
                )}
                {beach.facilities.shadeStructures && (
                  <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
                    <span className="text-2xl">⛱️</span>
                    <p className="font-medium text-slate-900">Shade Available</p>
                  </div>
                )}
                {beach.facilities.beachWheelchair && (
                  <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
                    <span className="text-2xl">♿</span>
                    <p className="font-medium text-slate-900">Beach Wheelchair</p>
                  </div>
                )}
              </div>
            </section>

            {/* Safety Recommendations */}
            <section className="rounded-xl bg-amber-50 p-6 ring-1 ring-amber-200">
              <h3 className="mb-3 font-semibold text-amber-900">Safety Tips</h3>
              <ul className="space-y-2 text-sm text-amber-800">
                {conditions.uvIndex >= 6 && (
                  <li className="flex items-start gap-2">
                    <span>☀️</span>
                    <span>Apply SPF 30+ sunscreen every 2 hours</span>
                  </li>
                )}
                {conditions.temp >= 85 && (
                  <li className="flex items-start gap-2">
                    <span>💧</span>
                    <span>Stay hydrated - drink water regularly</span>
                  </li>
                )}
                {conditions.windSpeed >= 15 && (
                  <li className="flex items-start gap-2">
                    <span>💨</span>
                    <span>Secure your belongings in windy conditions</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <span>🏊</span>
                  <span>Swim near lifeguard stations when available</span>
                </li>
              </ul>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default function LivePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-500 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <LiveContent />
    </Suspense>
  );
}

