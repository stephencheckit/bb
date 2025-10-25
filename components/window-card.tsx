'use client';

import { Window } from '@/lib/models/conditions';
import { formatTimeRange } from '@/lib/utils/formatters';
import Link from 'next/link';

interface WindowCardProps {
  window: Window;
  beachId: string;
}

export function WindowCard({ window, beachId }: WindowCardProps) {
  const scoreColor =
    window.score >= 80
      ? 'bg-emerald-500'
      : window.score >= 70
      ? 'bg-blue-500'
      : window.score >= 60
      ? 'bg-amber-500'
      : 'bg-orange-500';

  const borderClass = window.isGoNow ? 'ring-4 ring-sky-400' : '';

  return (
    <div
      className={`rounded-2xl bg-white p-5 shadow-md transition-all hover:shadow-lg ${borderClass}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-bold text-slate-900">
            {formatTimeRange(window.startTime, window.endTime)}
          </p>
          {window.isGoNow && (
            <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              Go Now!
            </span>
          )}
        </div>
        <div className={`rounded-full ${scoreColor} px-3 py-1`}>
          <span className="text-lg font-bold text-white">{window.score}</span>
        </div>
      </div>

      {/* Badges */}
      <div className="mt-3 flex flex-wrap gap-2">
        {window.badges.slice(0, 3).map((badge) => (
          <span
            key={badge.id}
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
          >
            <span>{badge.icon}</span>
            <span>{badge.label}</span>
          </span>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
        <span>{Math.round(window.conditions.temp)}°F</span>
        <span>•</span>
        <span>UV {window.conditions.uvIndex.toFixed(1)}</span>
        <span>•</span>
        <span>{Math.round(window.conditions.windSpeed)} mph wind</span>
      </div>

      {/* CTA Button */}
      <Link
        href={`/plan?beachId=${beachId}&windowStart=${window.startTime.toISOString()}&windowEnd=${window.endTime.toISOString()}`}
        className="mt-4 block w-full rounded-full bg-sky-500 py-2.5 text-center font-semibold text-white transition-colors hover:bg-sky-600"
      >
        Plan This Trip
      </Link>
    </div>
  );
}

