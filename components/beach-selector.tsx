'use client';

import { useState } from 'react';
import { Beach } from '@/lib/models/beach';

interface BeachSelectorProps {
  beaches: Beach[];
  selectedId: string;
  onSelect: (beachId: string) => void;
  favorites?: string[];
}

export function BeachSelector({
  beaches,
  selectedId,
  onSelect,
  favorites = [],
}: BeachSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedBeach = beaches.find((b) => b.id === selectedId);
  
  // Sort beaches: favorites first, then by name
  const sortedBeaches = [...beaches].sort((a, b) => {
    const aFav = favorites.includes(a.id);
    const bFav = favorites.includes(b.id);
    
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 shadow-md ring-1 ring-slate-200 transition-all hover:shadow-lg"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏖️</span>
          <div className="text-left">
            <p className="text-xs font-medium text-slate-500">Beach</p>
            <p className="font-semibold text-slate-900">
              {selectedBeach?.name || 'Select a beach'}
            </p>
          </div>
        </div>
        <svg
          className={`h-5 w-5 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute z-20 mt-2 w-full rounded-xl bg-white shadow-xl ring-1 ring-slate-200">
            <div className="max-h-96 overflow-auto p-2">
              {sortedBeaches.map((beach) => {
                const isFavorite = favorites.includes(beach.id);
                const isSelected = beach.id === selectedId;

                return (
                  <button
                    key={beach.id}
                    onClick={() => {
                      onSelect(beach.id);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      isSelected
                        ? 'bg-sky-50 text-sky-900'
                        : 'text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {isFavorite && <span className="text-amber-500">⭐</span>}
                    <div className="flex-1">
                      <p className="font-semibold">{beach.name}</p>
                      <p className="text-xs text-slate-600">
                        {beach.facilities.lifeguard && '🏊 Lifeguard'}{' '}
                        {beach.facilities.restroom && '🚻 Restroom'}{' '}
                        {beach.parking.available && '🅿️ Parking'}
                      </p>
                    </div>
                    {isSelected && (
                      <svg
                        className="h-5 w-5 text-sky-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

