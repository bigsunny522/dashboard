'use client';

import { useEffect, useState } from 'react';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export function CalendarWidget() {
  const [today, setToday] = useState<Date | null>(null);
  const [viewDate, setViewDate] = useState<Date>(new Date());

  useEffect(() => {
    const now = new Date();
    setToday(now);
    setViewDate(now);
  }, []);

  if (!today) return null;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const isToday = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="flex flex-col h-full gap-1">
      <div className="flex items-center justify-between">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="w-5 h-5 flex items-center justify-center opacity-50 hover:opacity-100 text-sm">‹</button>
        <span className="text-xs font-semibold">{year}年{month + 1}月</span>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="w-5 h-5 flex items-center justify-center opacity-50 hover:opacity-100 text-sm">›</button>
      </div>
      <div className="grid grid-cols-7 gap-px text-center">
        {WEEKDAYS.map((w, i) => (
          <div key={w} className={`text-[9px] py-0.5 opacity-40 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : ''}`}>{w}</div>
        ))}
        {cells.map((d, i) => (
          <div key={i}
            className={`text-[11px] leading-5 rounded ${d && isToday(d) ? 'font-bold text-slate-900' : i % 7 === 0 ? 'text-red-400 opacity-70' : i % 7 === 6 ? 'text-blue-400 opacity-70' : 'opacity-70'}`}
            style={d && isToday(d) ? { background: 'var(--dash-accent, #38bdf8)' } : {}}>
            {d ?? ''}
          </div>
        ))}
      </div>
    </div>
  );
}
