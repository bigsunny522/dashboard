'use client';

import { useEffect, useRef, useState } from 'react';
import type { PomodoroConfig } from '@/lib/dashboard/types';

type Phase = 'work' | 'break';

export function PomodoroWidget({ config }: { config: PomodoroConfig }) {
  const [phase, setPhase] = useState<Phase>('work');
  const [remaining, setRemaining] = useState(config.workMinutes * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemaining(config.workMinutes * 60);
    setRunning(false);
    setPhase('work');
  }, [config.workMinutes, config.breakMinutes]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          const next: Phase = phase === 'work' ? 'break' : 'work';
          setPhase(next);
          setRunning(false);
          if (phase === 'work') setSessions((s) => s + 1);
          return next === 'work' ? config.workMinutes * 60 : config.breakMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, phase, config.workMinutes, config.breakMinutes]);

  const total = phase === 'work' ? config.workMinutes * 60 : config.breakMinutes * 60;
  const pct = ((total - remaining) / total) * 100;
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const radius = 38;
  const circ = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <p className="text-[11px] opacity-50 leading-none">{phase === 'work' ? '🍅 作業' : '☕ 休憩'} · {sessions}回</p>
      <div className="relative">
        <svg width="96" height="96" className="-rotate-90">
          <circle cx="48" cy="48" r={radius} fill="none" strokeWidth="5" stroke="rgba(255,255,255,0.1)" />
          <circle cx="48" cy="48" r={radius} fill="none" strokeWidth="5"
            stroke="var(--dash-accent, #38bdf8)"
            strokeDasharray={circ}
            strokeDashoffset={circ - (circ * pct) / 100}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-mono font-bold tabular-nums">
            {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
          </span>
        </div>
      </div>
      <div className="flex gap-1.5">
        <button onClick={() => setRunning((r) => !r)}
          className="px-3 py-1 rounded-lg text-xs font-semibold"
          style={{ background: 'var(--dash-accent, #38bdf8)', color: '#0f172a' }}>
          {running ? '停止' : '開始'}
        </button>
        <button onClick={() => { setRunning(false); setPhase('work'); setRemaining(config.workMinutes * 60); }}
          className="px-2 py-1 rounded-lg text-xs bg-white/10">
          ↺
        </button>
      </div>
    </div>
  );
}
