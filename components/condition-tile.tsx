'use client';

interface ConditionTileProps {
  icon: string;
  label: string;
  value: string;
  status?: 'safe' | 'caution' | 'danger';
  subtitle?: string;
}

export function ConditionTile({
  icon,
  label,
  value,
  status = 'safe',
  subtitle,
}: ConditionTileProps) {
  const statusColors = {
    safe: 'ring-emerald-200 bg-emerald-50',
    caution: 'ring-amber-200 bg-amber-50',
    danger: 'ring-red-200 bg-red-50',
  };

  const statusTextColors = {
    safe: 'text-emerald-700',
    caution: 'text-amber-700',
    danger: 'text-red-700',
  };

  return (
    <div className={`rounded-xl p-4 ring-2 ${statusColors[status]}`}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
      <p className={`mt-2 text-2xl font-bold ${statusTextColors[status]}`}>
        {value}
      </p>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}

