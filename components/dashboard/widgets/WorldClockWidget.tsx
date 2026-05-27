'use client';

import { useEffect, useState } from 'react';
import type { WorldClockConfig } from '@/lib/dashboard/types';

export function WorldClockWidget({ config }: { config: WorldClockConfig }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  return (
    <div className="flex flex-col justify-center gap-1 h-full">
      {config.timezones.map(({ tz, label }) => {
        const timeStr = new Intl.DateTimeFormat('ja-JP', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(now);
        return (
          <div key={tz} className="flex items-center justify-between">
            <span className="text-[11px] opacity-50">{label}</span>
            <span className="text-lg font-mono font-semibold tabular-nums leading-none">{timeStr}</span>
          </div>
        );
      })}
    </div>
  );
}
