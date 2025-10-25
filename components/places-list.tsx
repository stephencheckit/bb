'use client';

import { NearbyPlace } from '@/lib/models/beach';
import { formatDistance, formatWalkTime } from '@/lib/services/places.service';

interface PlacesListProps {
  places: NearbyPlace[];
  maxItems?: number;
}

const TYPE_LABELS = {
  restaurant: 'Restaurant',
  cafe: 'Cafe',
  bar: 'Bar',
  convenience: 'Store',
};

const TYPE_ICONS = {
  restaurant: '🍽️',
  cafe: '☕',
  bar: '🍹',
  convenience: '🏪',
};

export function PlacesList({ places, maxItems = 10 }: PlacesListProps) {
  const displayPlaces = places.slice(0, maxItems);

  if (displayPlaces.length === 0) {
    return (
      <div className="rounded-xl bg-slate-50 p-6 text-center">
        <p className="text-slate-500">No nearby places found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayPlaces.map((place) => (
        <div
          key={place.id}
          className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md"
        >
          {/* Icon */}
          <div className="flex-shrink-0">
            <span className="text-3xl">{TYPE_ICONS[place.type]}</span>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900">{place.name}</h4>
            <p className="mt-0.5 text-sm text-slate-600">
              {TYPE_LABELS[place.type]}
            </p>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
              <span>{formatDistance(place.distance)}</span>
              <span>•</span>
              <span>{formatWalkTime(place.walkTime || 0)}</span>
            </div>
          </div>

          {/* Status Badge */}
          {place.isOpen !== undefined && (
            <div className="flex-shrink-0">
              <span
                className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                  place.isOpen
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {place.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

