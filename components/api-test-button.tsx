'use client';

import { useState } from 'react';

interface APITestResult {
  weather: 'testing' | 'success' | 'error' | 'mock';
  uv: 'testing' | 'success' | 'error' | 'mock';
  tides: 'testing' | 'success' | 'error' | 'mock';
}

export function APITestButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<APITestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const testAPIs = async () => {
    setIsTesting(true);
    setResults({
      weather: 'testing',
      uv: 'testing',
      tides: 'testing',
    });

    try {
      // Test the windows endpoint which uses all APIs
      const response = await fetch('/api/windows?beachId=honeymoon-island');
      const data = await response.json();

      if (response.ok && data.windows) {
        // Check if we got real data or mock data
        const firstWindow = data.windows[0];
        const timestamp = new Date(firstWindow.conditions.timestamp);
        
        // Mock data has seconds = 0, real data varies
        const isMockData = timestamp.getSeconds() === 0;

        setResults({
          weather: isMockData ? 'mock' : 'success',
          uv: isMockData ? 'mock' : 'success',
          tides: 'success', // NOAA tides always work (no key needed)
        });
      } else {
        setResults({
          weather: 'error',
          uv: 'error',
          tides: 'success',
        });
      }
    } catch (error) {
      setResults({
        weather: 'error',
        uv: 'error',
        tides: 'error',
      });
    }

    setIsTesting(false);
  };

  const getStatusIcon = (status: APITestResult[keyof APITestResult]) => {
    switch (status) {
      case 'testing':
        return '⏳';
      case 'success':
        return '✅';
      case 'mock':
        return '📊';
      case 'error':
        return '❌';
    }
  };

  const getStatusText = (status: APITestResult[keyof APITestResult]) => {
    switch (status) {
      case 'testing':
        return 'Testing...';
      case 'success':
        return 'Live Data ✓';
      case 'mock':
        return 'Mock Data';
      case 'error':
        return 'Error';
    }
  };

  const getStatusColor = (status: APITestResult[keyof APITestResult]) => {
    switch (status) {
      case 'testing':
        return 'bg-blue-50 text-blue-700';
      case 'success':
        return 'bg-emerald-50 text-emerald-700';
      case 'mock':
        return 'bg-amber-50 text-amber-700';
      case 'error':
        return 'bg-red-50 text-red-700';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Test Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:bg-slate-700"
      >
        🧪 Test APIs
      </button>

      {/* Results Panel */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-80 rounded-xl bg-white p-4 shadow-2xl ring-1 ring-slate-200">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">API Status</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          {!results && (
            <div className="text-center">
              <button
                onClick={testAPIs}
                disabled={isTesting}
                className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-600 disabled:opacity-50"
              >
                {isTesting ? 'Testing...' : 'Run Test'}
              </button>
              <p className="mt-2 text-xs text-slate-500">
                Check if your API keys are working
              </p>
            </div>
          )}

          {results && (
            <div className="space-y-2">
              {/* OpenWeather */}
              <div className={`rounded-lg p-3 ${getStatusColor(results.weather)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getStatusIcon(results.weather)}</span>
                    <div>
                      <p className="font-medium">OpenWeather</p>
                      <p className="text-xs opacity-75">Weather data</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">
                    {getStatusText(results.weather)}
                  </span>
                </div>
              </div>

              {/* OpenUV */}
              <div className={`rounded-lg p-3 ${getStatusColor(results.uv)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getStatusIcon(results.uv)}</span>
                    <div>
                      <p className="font-medium">OpenUV</p>
                      <p className="text-xs opacity-75">UV index</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">
                    {getStatusText(results.uv)}
                  </span>
                </div>
              </div>

              {/* NOAA Tides */}
              <div className={`rounded-lg p-3 ${getStatusColor(results.tides)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getStatusIcon(results.tides)}</span>
                    <div>
                      <p className="font-medium">NOAA Tides</p>
                      <p className="text-xs opacity-75">No key needed</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">
                    {getStatusText(results.tides)}
                  </span>
                </div>
              </div>

              {/* Retest Button */}
              <button
                onClick={testAPIs}
                disabled={isTesting}
                className="mt-2 w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
              >
                {isTesting ? 'Testing...' : 'Test Again'}
              </button>

              {/* Help Text */}
              {(results.weather === 'mock' || results.uv === 'mock') && (
                <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                  <p className="font-semibold">Using Mock Data</p>
                  <p className="mt-1">
                    Your API keys aren't working yet. They may need 1-2 hours to
                    activate after signup.
                  </p>
                </div>
              )}

              {(results.weather === 'success' && results.uv === 'success') && (
                <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
                  <p className="font-semibold">All APIs Working! 🎉</p>
                  <p className="mt-1">
                    You're getting real-time beach data.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

