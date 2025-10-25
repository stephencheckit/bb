'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Beach } from '@/lib/models/beach';
import { Window } from '@/lib/models/conditions';
import { BeachSelector } from '@/components/beach-selector';
import { BeachScoreCard } from '@/components/beach-score-card';
import { WindowCard } from '@/components/window-card';
import { ConditionTile } from '@/components/condition-tile';
import { WeeklyForecast } from '@/components/weekly-forecast';
import { loadFavorites } from '@/lib/utils/storage';
import { formatTemp, formatUV, formatWindSpeed, formatTideHeight, formatTime } from '@/lib/utils/formatters';
import { getUVSafetyLevel } from '@/lib/services/uv.service';
import { getTimeOfDayTheme } from '@/lib/utils/time-of-day';

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

  // Get time of day theme
  const timeTheme = getTimeOfDayTheme();

  // Fetch windows for selected beach
  const { data, error, isLoading } = useSWR(
    selectedBeachId ? `/api/windows?beachId=${selectedBeachId}` : null,
    fetcher,
    { refreshInterval: 900000 } // Refresh every 15 minutes
  );

  // Fetch current conditions separately
  const { data: currentData } = useSWR(
    selectedBeachId ? `/api/conditions?beachId=${selectedBeachId}` : null,
    fetcher,
    { refreshInterval: 900000 } // Refresh every 15 minutes
  );

  // Fetch weekly forecast
  const { data: forecastData } = useSWR(
    selectedBeachId ? `/api/forecast?beachId=${selectedBeachId}` : null,
    fetcher,
    { refreshInterval: 3600000 } // Refresh every hour
  );

  const windows: Window[] = data?.windows || [];
  const bestWindow = windows.length > 0 ? windows[0] : null;
  const goNowWindow = windows.find((w: Window) => w.isGoNow);
  const displayWindow = goNowWindow || bestWindow;
  const currentConditions = currentData?.conditions;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${timeTheme.background} transition-colors duration-1000`}>
      {/* Header */}
      <header className={`shadow-sm ${timeTheme.period === 'night' ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold tracking-tight ${timeTheme.period === 'night' ? 'text-white' : 'text-slate-900'}`}>
                Beach Buddy 🏖️
              </h1>
              <p className={`mt-1 text-sm ${timeTheme.period === 'night' ? 'text-slate-300' : 'text-slate-600'}`}>
                Your smart beach day concierge
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Nighttime Banner */}
        {(timeTheme.period === 'night' || timeTheme.period === 'dusk') && currentConditions?.sunrise && (
          <div className={`mb-6 rounded-xl border p-4 ${timeTheme.period === 'night' ? 'bg-indigo-900/20 border-indigo-700' : 'bg-purple-50 border-purple-200'}`}>
            <div className="flex items-center gap-3">
              <div className="text-3xl">🌙</div>
              <div className="flex-1">
                <p className={`font-semibold ${timeTheme.period === 'night' ? 'text-white' : 'text-slate-900'}`}>
                  It's nighttime—not the ideal beach day!
                </p>
                <p className={`text-sm mt-1 ${timeTheme.period === 'night' ? 'text-slate-300' : 'text-slate-600'}`}>
                  🌅 Sunrise tomorrow at {formatTime(new Date(currentConditions.sunrise))} · Beach times shown below are for tomorrow!
                </p>
              </div>
            </div>
          </div>
        )}

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
            <div className={`inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent ${timeTheme.period === 'night' ? 'border-sky-400' : 'border-sky-500'}`}></div>
            <p className={`mt-4 ${timeTheme.period === 'night' ? 'text-slate-300' : 'text-slate-600'}`}>Loading conditions...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className={`mt-8 rounded-xl p-6 text-center ${timeTheme.period === 'night' ? 'bg-red-900/20 border border-red-700' : 'bg-red-50'}`}>
            <p className={timeTheme.period === 'night' ? 'text-red-200' : 'text-red-700'}>Failed to load beach conditions</p>
            <p className={`mt-2 text-sm ${timeTheme.period === 'night' ? 'text-red-300' : 'text-red-600'}`}>
              Please check your API keys and try again
            </p>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && !error && displayWindow && (
          <div className="mt-8 space-y-8">
            {/* Hero: Current/Best Window Score */}
            <section>
              <h2 className={`mb-4 text-2xl font-bold ${timeTheme.period === 'night' ? 'text-white' : 'text-slate-900'}`}>
                {goNowWindow && goNowWindow.score > 30 
                  ? 'Go Now! 🌊' 
                  : timeTheme.period === 'night' || timeTheme.period === 'dusk'
                  ? 'Right Now 🌙'
                  : 'Current Conditions'}
              </h2>
              <BeachScoreCard 
                window={goNowWindow || {
                  ...displayWindow,
                  conditions: currentConditions || displayWindow.conditions,
                  score: currentConditions && (timeTheme.period === 'night' || timeTheme.period === 'dusk') ? 30 : displayWindow.score,
                  badges: (timeTheme.period === 'night' || timeTheme.period === 'dusk') ? [
                    { id: 'nighttime', label: '🌙 Nighttime', icon: '🌙', type: 'negative' as const },
                    ...(currentConditions?.badges || displayWindow.badges).filter((b: { id: string }) => b.id !== 'nighttime')
                  ] : (currentConditions?.badges || displayWindow.badges)
                }} 
                showDetails 
              />
            </section>

            {/* Current Conditions */}
            {currentConditions && (
              <section>
                <h2 className={`mb-4 text-xl font-bold ${timeTheme.period === 'night' ? 'text-white' : 'text-slate-900'}`}>
                  Current Conditions
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <ConditionTile
                    icon="🌡️"
                    label="Temperature"
                    value={formatTemp(currentConditions.temp)}
                    status={
                      currentConditions.temp >= 80 && currentConditions.temp <= 90
                        ? 'safe'
                        : currentConditions.temp < 70 || currentConditions.temp > 95
                        ? 'danger'
                        : 'caution'
                    }
                    subtitle={`Feels like ${formatTemp(currentConditions.feelsLike)}`}
                  />
                  <ConditionTile
                    icon="☀️"
                    label="UV Index"
                    value={formatUV(currentConditions.uvIndex)}
                    status={
                      currentConditions.uvIndex <= 5
                        ? 'safe'
                        : currentConditions.uvIndex <= 7
                        ? 'caution'
                        : 'danger'
                    }
                    subtitle={getUVSafetyLevel(currentConditions.uvIndex).description}
                  />
                  <ConditionTile
                    icon="💨"
                    label="Wind"
                    value={formatWindSpeed(currentConditions.windSpeed)}
                    status={
                      currentConditions.windSpeed < 10
                        ? 'safe'
                        : currentConditions.windSpeed < 20
                        ? 'caution'
                        : 'danger'
                    }
                    subtitle={currentConditions.windGust ? `Gusts ${currentConditions.windGust} mph` : 'Steady'}
                  />
                  <ConditionTile
                    icon="🌊"
                    label="Tide"
                    value={formatTideHeight(currentConditions.tideHeight)}
                    status="safe"
                    subtitle={currentConditions.tideType}
                  />
                </div>
                
                {/* Sun Info */}
                {(currentConditions.sunrise || currentConditions.sunset || currentConditions.sunExposure !== undefined) && (() => {
                  // Check if it's actually nighttime right now
                  const now = new Date();
                  const sunrise = currentConditions.sunrise ? new Date(currentConditions.sunrise) : null;
                  const sunset = currentConditions.sunset ? new Date(currentConditions.sunset) : null;
                  const isCurrentlyNight = sunrise && sunset && (now < sunrise || now > sunset);
                  const actualSunExposure = isCurrentlyNight ? 0 : currentConditions.sunExposure;
                  
                  return (
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {currentConditions.sunrise && (
                        <ConditionTile
                          icon="🌅"
                          label="Sunrise"
                          value={formatTime(new Date(currentConditions.sunrise))}
                          status="safe"
                        />
                      )}
                      {currentConditions.sunset && (
                        <ConditionTile
                          icon="🌇"
                          label="Sunset"
                          value={formatTime(new Date(currentConditions.sunset))}
                          status="safe"
                        />
                      )}
                      {actualSunExposure !== undefined && (
                        <ConditionTile
                          icon={actualSunExposure >= 80 ? '☀️' : actualSunExposure >= 50 ? '⛅' : actualSunExposure > 0 ? '☁️' : '🌙'}
                          label="Sun Exposure"
                          value={`${Math.round(actualSunExposure)}%`}
                          status={
                            actualSunExposure >= 80
                              ? 'safe'
                              : actualSunExposure >= 50
                              ? 'caution'
                              : 'danger'
                          }
                          subtitle={
                            actualSunExposure === 0
                              ? 'Nighttime'
                              : actualSunExposure >= 80
                              ? 'Sunny!'
                              : actualSunExposure >= 50
                              ? 'Partly cloudy'
                              : 'Mostly cloudy'
                          }
                        />
                      )}
                    </div>
                  );
                })()}
              </section>
            )}

          </div>
        )}

        {/* Weekly Forecast */}
        {!isLoading && !error && forecastData?.forecast && (
          <section className="mt-8">
            <WeeklyForecast 
              forecast={forecastData.forecast}
              beachName={forecastData.beach?.name || 'this beach'}
            />
          </section>
        )}

        {/* No Data State */}
        {!isLoading && !error && windows.length === 0 && (
          <div className={`mt-8 rounded-xl p-8 text-center ${timeTheme.period === 'night' ? 'bg-slate-800/50 border border-slate-700' : 'bg-sky-50 border border-sky-200'}`}>
            <div className="mb-4 text-5xl">🏖️</div>
            <p className={`text-xl font-bold mb-2 ${timeTheme.period === 'night' ? 'text-white' : 'text-slate-900'}`}>
              No Forecast Data Available
            </p>
            <p className={`text-sm ${timeTheme.period === 'night' ? 'text-slate-300' : 'text-slate-600'}`}>
              Unable to load beach conditions for this location. Please try again later.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`mt-16 border-t py-8 ${timeTheme.period === 'night' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
        <div className={`mx-auto max-w-4xl px-4 text-center text-sm ${timeTheme.period === 'night' ? 'text-slate-400' : 'text-slate-500'}`}>
          <p>Beach Buddy 🏖️ · Palm Harbor, FL · Made with ☀️</p>
        </div>
      </footer>
    </div>
  );
}

