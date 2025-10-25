'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Beach } from '@/lib/models/beach';
import { Window } from '@/lib/models/conditions';
import { BeachSelector } from '@/components/beach-selector';
import { BeachScoreCard } from '@/components/beach-score-card';
import { WindowCard } from '@/components/window-card';
import { ConditionTile } from '@/components/condition-tile';
import { loadFavorites } from '@/lib/utils/storage';
import { formatTemp, formatUV, formatWindSpeed, formatTideHeight } from '@/lib/utils/formatters';
import { getUVSafetyLevel } from '@/lib/services/uv.service';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface HomePageProps {
  beaches: Beach[];
}

export default function HomePage({ beaches }: HomePageProps) {
  const [selectedBeachId, setSelectedBeachId] = useState<string>(beaches[0]?.id || '');
  const [favorites] = useState<string[]>(() => {
    // Initialize favorites from localStorage
    if (typeof window !== 'undefined') {
      return loadFavorites();
    }
    return [];
  });

  // Fetch windows for selected beach
  const { data, error, isLoading } = useSWR(
    selectedBeachId ? `/api/windows?beachId=${selectedBeachId}` : null,
    fetcher,
    { refreshInterval: 900000 } // Refresh every 15 minutes
  );

  const windows: Window[] = data?.windows || [];
  const bestWindow = windows.length > 0 ? windows[0] : null;
  const goNowWindow = windows.find((w: Window) => w.isGoNow);
  const displayWindow = goNowWindow || bestWindow;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Beach Buddy 🏖️
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Your smart beach day concierge
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Beach Selector */}
        <BeachSelector
          beaches={beaches}
          selectedId={selectedBeachId}
          onSelect={setSelectedBeachId}
          favorites={favorites}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="mt-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-500 border-r-transparent"></div>
            <p className="mt-4 text-slate-600">Loading conditions...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-8 rounded-xl bg-red-50 p-6 text-center">
            <p className="text-red-700">Failed to load beach conditions</p>
            <p className="mt-2 text-sm text-red-600">
              Please check your API keys and try again
            </p>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && !error && displayWindow && (
          <div className="mt-8 space-y-8">
            {/* Hero: Best Window */}
            <section>
              <h2 className="mb-4 text-2xl font-bold text-slate-900">
                {goNowWindow ? 'Go Now! 🌊' : 'Best Time Today'}
              </h2>
              <BeachScoreCard window={displayWindow} showDetails />
            </section>

            {/* Current Conditions */}
            <section>
              <h2 className="mb-4 text-xl font-bold text-slate-900">
                Current Conditions
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <ConditionTile
                  icon="🌡️"
                  label="Temperature"
                  value={formatTemp(displayWindow.conditions.temp)}
                  status={
                    displayWindow.conditions.temp >= 80 && displayWindow.conditions.temp <= 90
                      ? 'safe'
                      : displayWindow.conditions.temp < 70 || displayWindow.conditions.temp > 95
                      ? 'danger'
                      : 'caution'
                  }
                  subtitle={`Feels like ${formatTemp(displayWindow.conditions.feelsLike)}`}
                />
                <ConditionTile
                  icon="☀️"
                  label="UV Index"
                  value={formatUV(displayWindow.conditions.uvIndex)}
                  status={
                    displayWindow.conditions.uvIndex <= 5
                      ? 'safe'
                      : displayWindow.conditions.uvIndex <= 7
                      ? 'caution'
                      : 'danger'
                  }
                  subtitle={getUVSafetyLevel(displayWindow.conditions.uvIndex).description}
                />
                <ConditionTile
                  icon="💨"
                  label="Wind"
                  value={formatWindSpeed(displayWindow.conditions.windSpeed)}
                  status={
                    displayWindow.conditions.windSpeed < 10
                      ? 'safe'
                      : displayWindow.conditions.windSpeed < 20
                      ? 'caution'
                      : 'danger'
                  }
                  subtitle={displayWindow.conditions.windGust ? `Gusts ${displayWindow.conditions.windGust} mph` : 'Steady'}
                />
                <ConditionTile
                  icon="🌊"
                  label="Tide"
                  value={formatTideHeight(displayWindow.conditions.tideHeight)}
                  status="safe"
                  subtitle={displayWindow.conditions.tideType}
                />
              </div>
            </section>

            {/* Other Time Windows */}
            {windows.length > 1 && (
              <section>
                <h2 className="mb-4 text-xl font-bold text-slate-900">
                  Other Times Today
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {windows.slice(1, 4).map((window: Window) => (
                    <WindowCard
                      key={window.id}
                      window={window}
                      beachId={selectedBeachId}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* No Data State */}
        {!isLoading && !error && windows.length === 0 && (
          <div className="mt-8 rounded-xl bg-slate-50 p-8 text-center">
            <p className="text-lg text-slate-600">
              No forecast data available for this beach
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-4xl px-4 text-center text-sm text-slate-500">
          <p>Beach Buddy · Palm Harbor, FL · Made with ☀️</p>
        </div>
      </footer>
    </div>
  );
}

