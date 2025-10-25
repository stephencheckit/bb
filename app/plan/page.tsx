'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Beach } from '@/lib/models/beach';
import { Plan } from '@/lib/models/plan';
import { Checklist } from '@/components/checklist';
import { PlacesList } from '@/components/places-list';
import { formatTime, formatTimeRange } from '@/lib/utils/formatters';
import beaches from '@/data/beaches.json';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function PlanContent() {
  const searchParams = useSearchParams();
  const beachId = searchParams.get('beachId');
  const windowStart = searchParams.get('windowStart');
  const windowEnd = searchParams.get('windowEnd');
  
  // Check if conditions are passed via query params (for future dates)
  const tempParam = searchParams.get('temp');
  const uvIndexParam = searchParams.get('uvIndex');
  const windSpeedParam = searchParams.get('windSpeed');

  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Find beach
  const beach = beaches.find((b: Beach) => b.id === beachId);

  // Fetch conditions for the selected window (only if not passed via params)
  const shouldFetchConditions = !tempParam && !uvIndexParam && !windSpeedParam;
  const { data: conditionsData } = useSWR(
    shouldFetchConditions && beachId ? `/api/conditions?beachId=${beachId}` : null,
    fetcher
  );

  // Generate plan when we have conditions (either from API or query params)
  useEffect(() => {
    if (!beachId || !windowStart || !windowEnd) {
      setIsLoading(false);
      return;
    }

    // Use query params if available, otherwise wait for API data
    let conditions;
    if (tempParam && uvIndexParam && windSpeedParam) {
      conditions = {
        temp: parseFloat(tempParam),
        uvIndex: parseFloat(uvIndexParam),
        windSpeed: parseFloat(windSpeedParam),
      };
    } else if (conditionsData) {
      conditions = conditionsData.conditions;
    } else {
      return; // Still waiting for data
    }

    const generatePlan = async () => {
      try {
        const response = await fetch('/api/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            beachId,
            windowStart,
            windowEnd,
            conditions,
          }),
        });

        const data = await response.json();
        setPlan(data.plan);
      } catch (error) {
        console.error('Error generating plan:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generatePlan();
  }, [beachId, windowStart, windowEnd, conditionsData, tempParam, uvIndexParam, windSpeedParam]);

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-500 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Creating your plan...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-slate-600">Could not create plan</p>
          <Link href="/" className="mt-4 block text-center text-sky-500 hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <Link href="/" className="text-sm text-sky-500 hover:underline">
            ← Back to home
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Your Beach Day Plan
          </h1>
          <p className="mt-1 text-slate-600">{beach.name}</p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Trip Summary */}
          <section className="rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Window</p>
              <p className="mt-1 text-2xl font-bold">
                {formatTimeRange(
                  new Date(plan.arrivalTime),
                  plan.window.endTime
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium opacity-90">Leave by</p>
              <p className="mt-1 text-2xl font-bold">
                {formatTime(new Date(plan.departureTime))}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 border-t border-white/20 pt-4">
            <div>
              <p className="text-xs opacity-75">Temperature</p>
              <p className="mt-1 font-semibold">{Math.round(plan.window.conditions.temp)}°F</p>
            </div>
            <div>
              <p className="text-xs opacity-75">UV Index</p>
              <p className="mt-1 font-semibold">{plan.window.conditions.uvIndex.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-xs opacity-75">Wind</p>
              <p className="mt-1 font-semibold">{Math.round(plan.window.conditions.windSpeed)} mph</p>
            </div>
          </div>
        </section>

        {/* Parking Tips */}
        <section className="mt-6 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🅿️</span>
            <div>
              <p className="font-semibold text-amber-900">Parking</p>
              <p className="mt-1 text-sm text-amber-800">{plan.parkingTips}</p>
              {beach.parking.cost && (
                <p className="mt-1 text-sm font-medium text-amber-900">
                  Cost: {beach.parking.cost}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Checklist */}
        <section className="mt-8">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">
            Pack Your Bag ✓
          </h2>
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <Checklist items={plan.checklist} planId={plan.id} />
          </div>
        </section>

        {/* Nearby Places */}
        {plan.nearbyPlaces.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-2xl font-bold text-slate-900">
              Nearby Food & Drink
            </h2>
            <PlacesList places={plan.nearbyPlaces} maxItems={5} />
          </section>
        )}

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <Link
            href={`/live?beachId=${beachId}`}
            className="flex-1 rounded-full bg-sky-500 py-3 text-center font-semibold text-white transition-colors hover:bg-sky-600"
          >
            View Live Conditions
          </Link>
          <Link
            href="/"
            className="flex-1 rounded-full border-2 border-slate-300 bg-white py-3 text-center font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Choose Different Time
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-500 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <PlanContent />
    </Suspense>
  );
}

