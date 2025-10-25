'use client';

import { Window } from '@/lib/models/conditions';
import { getScoreRange } from '@/lib/scoring/weights';

interface BeachScoreCardProps {
  window: Window;
  showDetails?: boolean;
}

export function BeachScoreCard({ window, showDetails = false }: BeachScoreCardProps) {
  const scoreRange = getScoreRange(window.score);
  
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

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      {/* Score Display */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">BeachScore™</p>
          <div className={`mt-2 inline-flex items-center justify-center rounded-full bg-gradient-to-br ${gradientClass} px-6 py-3 ring-4`}>
            <span className="text-4xl font-bold text-white">{window.score}</span>
          </div>
          <p className="mt-2 text-lg font-semibold text-slate-800">{scoreRange.label}</p>
        </div>

        {/* Verdict */}
        <div className="text-right">
          <p className="text-xl font-bold text-slate-900">{scoreRange.verdict}</p>
          {window.isGoNow && (
            <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              Go Now!
            </span>
          )}
        </div>
      </div>

      {/* Badges */}
      {window.badges.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {window.badges.map((badge, index) => {
            const badgeColorClasses = {
              positive: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
              neutral: 'bg-blue-50 text-blue-700 ring-blue-200',
              warning: 'bg-amber-50 text-amber-700 ring-amber-200',
              negative: 'bg-red-50 text-red-700 ring-red-200',
            };

            return (
              <span
                key={badge.id || `badge-${index}`}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ring-1 ${
                  badgeColorClasses[badge.type]
                }`}
              >
                <span>{badge.icon}</span>
                <span>{badge.label}</span>
              </span>
            );
          })}
        </div>
      )}

      {/* Details */}
      {showDetails && (
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500">Temperature</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {Math.round(window.conditions.temp)}°F
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">UV Index</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {window.conditions.uvIndex.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Wind</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {Math.round(window.conditions.windSpeed)} mph
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Tide</p>
            <p className="mt-1 text-lg font-semibold capitalize text-slate-900">
              {window.conditions.tideType}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

