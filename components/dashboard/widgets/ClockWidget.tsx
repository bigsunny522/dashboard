'use client';

import { useEffect, useState } from 'react';
import type { ClockConfig } from '@/lib/dashboard/types';

const FONT_MAP = {
  default: 'font-sans',
  mono: 'font-mono',
  serif: 'font-serif',
};

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export function ClockWidget({ config }: { config: ClockConfig }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const hours = config.format === '12h' ? now.getHours() % 12 || 12 : now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ampm = config.format === '12h' ? (now.getHours() >= 12 ? 'PM' : 'AM') : null;
  const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${WEEKDAYS[now.getDay()]}`;

  return (
    <div className={`flex flex-col items-center justify-center h-full ${FONT_MAP[config.fontStyle]}`}>
      {config.showDate && (
        <p className="text-[11px] opacity-50 tracking-wider leading-none mb-1">{dateStr}</p>
      )}
      <div className="flex items-end gap-0.5 leading-none">
        <span className="text-5xl font-bold tabular-nums">
          {String(hours).padStart(2, '0')}:{minutes}
        </span>
        {config.showSeconds && (
          <span className="text-2xl font-semibold opacity-50 tabular-nums mb-0.5">:{seconds}</span>
        )}
        {ampm && (
          <span className="text-base opacity-60 mb-0.5 ml-0.5">{ampm}</span>
        )}
      </div>
    </div>
  );
}
