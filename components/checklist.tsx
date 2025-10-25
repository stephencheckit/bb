'use client';

import { useState, useEffect } from 'react';
import { ChecklistItem } from '@/lib/models/plan';
import { saveChecklist, loadChecklist } from '@/lib/utils/storage';

interface ChecklistProps {
  items: ChecklistItem[];
  planId: string;
}

const CATEGORY_LABELS = {
  essentials: 'Beach Essentials',
  'sun-protection': 'Sun Protection',
  hydration: 'Hydration',
  safety: 'Safety',
  comfort: 'Comfort',
  fun: 'Fun',
};

const CATEGORY_ICONS = {
  essentials: '🏖️',
  'sun-protection': '☀️',
  hydration: '💧',
  safety: '🚨',
  comfort: '😌',
  fun: '🎉',
};

export function Checklist({ items: initialItems, planId }: ChecklistProps) {
  // Load saved checklist state on initialization
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = loadChecklist<ChecklistItem>(planId);
      if (saved.length > 0) {
        // Merge saved state with initial items
        return initialItems.map((item) => {
          const savedItem = saved.find((s) => s.id === item.id);
          return savedItem ? { ...item, checked: savedItem.checked } : item;
        });
      }
    }
    return initialItems;
  });

  // Save checklist state when it changes
  useEffect(() => {
    if (items.length > 0) {
      saveChecklist(planId, items);
    }
  }, [items, planId]);

  const toggleItem = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  // Group items by category
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  // Calculate completion
  const totalItems = items.length;
  const checkedItems = items.filter((i) => i.checked).length;
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">
            {checkedItems} of {totalItems} packed
          </span>
          <span className="text-slate-500">{Math.round(progress)}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-sky-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist Items by Category */}
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category}>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
            <span>{CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]}</span>
            <span>{CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}</span>
          </h3>
          <div className="space-y-2">
            {categoryItems.map((item) => (
              <label
                key={item.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleItem(item.id)}
                  className="mt-1 h-5 w-5 flex-shrink-0 rounded border-slate-300 text-sky-500 focus:ring-2 focus:ring-sky-500"
                />
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      item.checked ? 'text-slate-400 line-through' : 'text-slate-900'
                    }`}
                  >
                    {item.item}
                  </p>
                  {item.reason && (
                    <p className="mt-0.5 text-xs text-slate-500">{item.reason}</p>
                  )}
                </div>
                {item.priority === 'essential' && (
                  <span className="flex-shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                    Essential
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

