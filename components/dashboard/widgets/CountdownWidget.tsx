'use client';

import { useEffect, useState } from 'react';
import type { CountdownConfig } from '@/lib/dashboard/types';

export function CountdownWidget({ config }: { config: CountdownConfig }) {
  const [diff, setDiff] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    const update = () => {
      const delta = new Date(config.targetDate).getTime() - Date.now();
      if (delta <= 0) { setPassed(true); setDiff({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setPassed(false);
      setDiff({
        d: Math.floor(delta / 86400000),
        h: Math.floor((delta % 86400000) / 3600000),
        m: Math.floor((delta % 3600000) / 60000),
        s: Math.floor((delta % 60000) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [config.targetDate]);

  if (!diff) return null;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-0.5">
      {config.label && <p className="text-[11px] opacity-50 leading-none">{config.label}</p>}
      {passed ? (
        <p className="text-xl font-bold" style={{ color: 'var(--dash-accent, #38bdf8)' }}>時間です！</p>
      ) : (
        <div className="flex items-end gap-2">
          {diff.d > 0 && (
            <div className="text-center">
              <p className="text-3xl font-mono font-bold tabular-nums leading-none">{diff.d}</p>
              <p className="text-[10px] opacity-40 mt-0.5">日</p>
            </div>
          )}
          {[{ v: diff.h, label: '時' }, { v: diff.m, label: '分' }, { v: diff.s, label: '秒' }].map(({ v, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-mono font-bold tabular-nums leading-none">{String(v).padStart(2, '0')}</p>
              <p className="text-[10px] opacity-40 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
