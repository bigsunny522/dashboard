'use client';

import { useState } from 'react';
import { useDashboardStore } from '@/lib/dashboard/store';
import type { TodoConfig } from '@/lib/dashboard/types';

export function TodoWidget({ id, config }: { id: string; config: TodoConfig }) {
  const updateWidgetConfig = useDashboardStore((s) => s.updateWidgetConfig);
  const [input, setInput] = useState('');

  const addItem = () => {
    if (!input.trim()) return;
    updateWidgetConfig(id, { items: [...config.items, { id: Date.now().toString(), text: input.trim(), done: false }] } as Partial<TodoConfig>);
    setInput('');
  };

  const toggleItem = (itemId: string) =>
    updateWidgetConfig(id, { items: config.items.map((item) => item.id === itemId ? { ...item, done: !item.done } : item) } as Partial<TodoConfig>);

  const removeItem = (itemId: string) =>
    updateWidgetConfig(id, { items: config.items.filter((item) => item.id !== itemId) } as Partial<TodoConfig>);

  return (
    <div className="flex flex-col h-full gap-1.5">
      <div className="flex gap-1">
        <input
          className="flex-1 bg-white/10 rounded px-2 py-1 text-xs outline-none placeholder:opacity-30 border border-white/10 focus:border-white/30"
          placeholder="タスクを追加..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <button onClick={addItem} className="px-2 rounded text-xs font-bold"
          style={{ background: 'var(--dash-accent, #38bdf8)', color: '#0f172a' }}>+</button>
      </div>
      <div className="flex flex-col gap-1 overflow-y-auto flex-1">
        {config.items.map((item) => (
          <div key={item.id} className="flex items-center gap-1.5 group">
            <button onClick={() => toggleItem(item.id)}
              className="w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center"
              style={item.done ? { background: 'var(--dash-accent, #38bdf8)', borderColor: 'transparent' } : { borderColor: 'rgba(255,255,255,0.3)' }}>
              {item.done && <span className="text-[8px] text-slate-900 font-bold">✓</span>}
            </button>
            <span className={`text-xs flex-1 leading-none ${item.done ? 'line-through opacity-30' : ''}`}>{item.text}</span>
            <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-40 text-[10px]">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
