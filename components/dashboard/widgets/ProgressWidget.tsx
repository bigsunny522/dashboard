'use client';

import { useEffect, useState } from 'react';
import type { ProgressConfig } from '@/lib/dashboard/types';

function getProgress(type: 'year' | 'month' | 'day' | 'week', now: Date) {
  switch (type) {
    case 'year': {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear() + 1, 0, 1);
      return ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100;
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100;
    }
    case 'week': {
      const day = now.getDay();
      const dayProgress = (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400;
      return ((day + dayProgress) / 7) * 100;
    }
    case 'day': {
      return ((now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400) * 100;
    }
  }
}

const LABELS: Record<string, string> = { year: '今年', month: '今月', week: '今週', day: '今日' };

export function ProgressWidget({ config }: { config: ProgressConfig }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  return (
    <div className="flex flex-col justify-center gap-2 h-full">
      {config.show.map((type) => {
        const pct = getProgress(type, now);
        return (
          <div key={type}>
            <div className="flex justify-between text-[11px] mb-0.5 opacity-60">
              <span>{LABELS[type]}</span>
              <span>{pct.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--dash-accent, #38bdf8)' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
