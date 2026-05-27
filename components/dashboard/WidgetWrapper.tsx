'use client';

import { Settings2, Trash2 } from 'lucide-react';
import { useDashboardStore } from '@/lib/dashboard/store';
import type { Widget } from '@/lib/dashboard/types';
import { ClockWidget } from './widgets/ClockWidget';
import { WeatherWidget } from './widgets/WeatherWidget';
import { ProgressWidget } from './widgets/ProgressWidget';
import { WorldClockWidget } from './widgets/WorldClockWidget';
import { TextWidget } from './widgets/TextWidget';
import { TodoWidget } from './widgets/TodoWidget';
import { CountdownWidget } from './widgets/CountdownWidget';
import { PomodoroWidget } from './widgets/PomodoroWidget';
import { BookmarksWidget } from './widgets/BookmarksWidget';
import { QuoteWidget } from './widgets/QuoteWidget';
import { CalendarWidget } from './widgets/CalendarWidget';
import type { ClockConfig, WeatherConfig, ProgressConfig, WorldClockConfig, TextConfig, TodoConfig, CountdownConfig, PomodoroConfig, BookmarksConfig, QuoteConfig } from '@/lib/dashboard/types';

const WIDGET_LABELS: Record<string, string> = {
  clock: '時計',
  weather: '天気',
  'world-clock': '世界時計',
  calendar: 'カレンダー',
  text: 'テキスト',
  todo: 'TODO',
  countdown: 'カウントダウン',
  pomodoro: 'ポモドーロ',
  progress: '進捗バー',
  bookmarks: 'ブックマーク',
  quote: '名言',
};

function WidgetContent({ widget }: { widget: Widget }) {
  switch (widget.type) {
    case 'clock':
      return <ClockWidget config={widget.config as ClockConfig} />;
    case 'weather':
      return <WeatherWidget config={widget.config as WeatherConfig} />;
    case 'progress':
      return <ProgressWidget config={widget.config as ProgressConfig} />;
    case 'world-clock':
      return <WorldClockWidget config={widget.config as WorldClockConfig} />;
    case 'text':
      return <TextWidget config={widget.config as TextConfig} />;
    case 'todo':
      return <TodoWidget id={widget.id} config={widget.config as TodoConfig} />;
    case 'countdown':
      return <CountdownWidget config={widget.config as CountdownConfig} />;
    case 'pomodoro':
      return <PomodoroWidget config={widget.config as PomodoroConfig} />;
    case 'bookmarks':
      return <BookmarksWidget config={widget.config as BookmarksConfig} />;
    case 'quote':
      return <QuoteWidget config={widget.config as QuoteConfig} />;
    case 'calendar':
      return <CalendarWidget />;
    default:
      return null;
  }
}

export function WidgetWrapper({ widget }: { widget: Widget }) {
  const isEditMode = useDashboardStore((s) => s.isEditMode);
  const removeWidget = useDashboardStore((s) => s.removeWidget);
  const setEditingWidget = useDashboardStore((s) => s.setEditingWidget);
  const setSettingsOpen = useDashboardStore((s) => s.setSettingsOpen);
  const theme = useDashboardStore((s) => s.config.theme);

  const bg = `rgba(255,255,255,${theme.widgetBgOpacity})`;
  const blur = theme.widgetBlur ? 'blur(12px)' : 'none';

  return (
    <div
      className="h-full w-full rounded-2xl overflow-hidden relative group"
      style={{
        background: bg,
        backdropFilter: blur,
        WebkitBackdropFilter: blur,
        border: '1px solid rgba(255,255,255,0.1)',
        color: theme.textColor,
      }}
    >
      {isEditMode && (
        <div className="absolute inset-x-0 top-0 flex items-center justify-between z-20"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        >
          <span className="drag-handle flex-1 px-2 py-1 text-[10px] font-semibold opacity-60 cursor-grab active:cursor-grabbing select-none">
            ⠿ {WIDGET_LABELS[widget.type]}
          </span>
          <div className="flex items-center gap-0.5 px-1">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setEditingWidget(widget.id); setSettingsOpen(true); }}
              className="p-1 rounded hover:bg-white/20 transition-colors"
              title="設定"
            >
              <Settings2 size={12} />
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }}
              className="p-1 rounded hover:bg-red-500/60 transition-colors opacity-60 hover:opacity-100"
              title="削除"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}

      <div className={`p-2 h-full ${isEditMode ? 'pt-7' : ''}`}>
        <WidgetContent widget={widget} />
      </div>
    </div>
  );
}
