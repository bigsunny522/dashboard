'use client';

import { useEffect, useRef, useState } from 'react';
import { useDashboardStore } from '@/lib/dashboard/store';
import { searchCities, getTimezone, type GeoResult } from '@/lib/dashboard/geocoding';
import { LocateFixed, Loader2 } from 'lucide-react';
import type {
  WidgetType,
  WidgetConfig,
  ClockConfig,
  WeatherConfig,
  WorldClockConfig,
  TextConfig,
  TodoConfig,
  CountdownConfig,
  PomodoroConfig,
  ProgressConfig,
  BookmarksConfig,
  QuoteConfig,
  DashboardTheme,
} from '@/lib/dashboard/types';

const WIDGET_CATALOG: { type: WidgetType; label: string; emoji: string; defaultConfig: WidgetConfig }[] = [
  {
    type: 'clock',
    label: '時計',
    emoji: '🕐',
    defaultConfig: { showSeconds: true, format: '24h', showDate: true, fontStyle: 'mono' } as ClockConfig,
  },
  {
    type: 'weather',
    label: '天気',
    emoji: '🌤️',
    defaultConfig: { latitude: 35.6762, longitude: 139.6503, cityName: '東京', unit: 'celsius', showForecast: true } as WeatherConfig,
  },
  {
    type: 'world-clock',
    label: '世界時計',
    emoji: '🌍',
    defaultConfig: {
      timezones: [
        { tz: 'America/New_York', label: 'New York' },
        { tz: 'Europe/London', label: 'London' },
        { tz: 'Asia/Tokyo', label: '東京' },
      ],
    } as WorldClockConfig,
  },
  {
    type: 'calendar',
    label: 'カレンダー',
    emoji: '📅',
    defaultConfig: {} as WidgetConfig,
  },
  {
    type: 'progress',
    label: '進捗バー',
    emoji: '📊',
    defaultConfig: { show: ['year', 'month', 'day'] } as ProgressConfig,
  },
  {
    type: 'todo',
    label: 'TODO',
    emoji: '✅',
    defaultConfig: { items: [] } as TodoConfig,
  },
  {
    type: 'countdown',
    label: 'カウントダウン',
    emoji: '⏳',
    defaultConfig: {
      targetDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      label: 'イベント',
    } as CountdownConfig,
  },
  {
    type: 'pomodoro',
    label: 'ポモドーロ',
    emoji: '🍅',
    defaultConfig: { workMinutes: 25, breakMinutes: 5 } as PomodoroConfig,
  },
  {
    type: 'bookmarks',
    label: 'ブックマーク',
    emoji: '🔖',
    defaultConfig: { items: [] } as BookmarksConfig,
  },
  {
    type: 'quote',
    label: '名言',
    emoji: '💬',
    defaultConfig: { customQuotes: [], useCustomOnly: false } as QuoteConfig,
  },
  {
    type: 'text',
    label: 'テキスト',
    emoji: '📝',
    defaultConfig: { content: 'メモを入力...', fontSize: 'md', align: 'left' } as TextConfig,
  },
];

function ThemeSettings() {
  const theme = useDashboardStore((s) => s.config.theme);
  const updateTheme = useDashboardStore((s) => s.updateTheme);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateTheme({ backgroundImageBase64: reader.result as string, backgroundType: 'image' });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs opacity-60 mb-2">背景タイプ</label>
        <div className="flex gap-2">
          {(['color', 'gradient', 'image'] as const).map((t) => (
            <button
              key={t}
              onClick={() => updateTheme({ backgroundType: t })}
              className={`flex-1 py-1.5 rounded-lg text-xs transition-colors ${theme.backgroundType === t ? 'font-semibold' : 'opacity-60'}`}
              style={theme.backgroundType === t ? { background: 'var(--dash-accent, #38bdf8)', color: '#0f172a' } : { background: 'rgba(255,255,255,0.1)' }}
            >
              {t === 'color' ? '単色' : t === 'gradient' ? 'グラデーション' : '画像'}
            </button>
          ))}
        </div>
      </div>

      {theme.backgroundType === 'color' && (
        <div>
          <label className="block text-xs opacity-60 mb-1">背景色</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={theme.backgroundColor}
              onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
              className="w-10 h-8 rounded cursor-pointer bg-transparent border-0"
            />
            <span className="text-xs font-mono opacity-60">{theme.backgroundColor}</span>
          </div>
        </div>
      )}

      {theme.backgroundType === 'gradient' && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs opacity-60 mb-1">開始色</label>
              <input type="color" value={theme.gradientFrom}
                onChange={(e) => updateTheme({ gradientFrom: e.target.value })}
                className="w-full h-8 rounded cursor-pointer bg-transparent border-0" />
            </div>
            <div className="flex-1">
              <label className="block text-xs opacity-60 mb-1">終了色</label>
              <input type="color" value={theme.gradientTo}
                onChange={(e) => updateTheme({ gradientTo: e.target.value })}
                className="w-full h-8 rounded cursor-pointer bg-transparent border-0" />
            </div>
          </div>
          <div>
            <label className="block text-xs opacity-60 mb-1">方向</label>
            <select
              value={theme.gradientDirection}
              onChange={(e) => updateTheme({ gradientDirection: e.target.value })}
              className="w-full bg-white/10 rounded-lg px-2 py-1.5 text-xs outline-none"
            >
              <option value="to bottom">↓ 縦</option>
              <option value="to right">→ 横</option>
              <option value="to bottom right">↘ 斜め</option>
              <option value="to top right">↗ 斜め</option>
            </select>
          </div>
        </div>
      )}

      {theme.backgroundType === 'image' && (
        <div className="flex flex-col gap-2">
          <div>
            <label className="block text-xs opacity-60 mb-1">画像URL</label>
            <input
              type="text"
              placeholder="https://..."
              value={theme.backgroundImageUrl}
              onChange={(e) => updateTheme({ backgroundImageUrl: e.target.value })}
              className="w-full bg-white/10 rounded-lg px-2 py-1.5 text-xs outline-none border border-white/10 focus:border-white/30"
            />
          </div>
          <div className="text-center text-xs opacity-40">または</div>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/20"
          >
            ファイルをアップロード
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          {(theme.backgroundImageBase64 || theme.backgroundImageUrl) && (
            <div>
              <label className="block text-xs opacity-60 mb-1">オーバーレイ不透明度</label>
              <input type="range" min="0" max="0.9" step="0.05"
                value={theme.backgroundOverlayOpacity}
                onChange={(e) => updateTheme({ backgroundOverlayOpacity: parseFloat(e.target.value) })}
                className="w-full accent-[var(--dash-accent)]" />
            </div>
          )}
          {theme.backgroundImageBase64 && (
            <button onClick={() => updateTheme({ backgroundImageBase64: '', backgroundType: 'color' })}
              className="text-xs opacity-50 hover:opacity-80">
              画像を削除
            </button>
          )}
        </div>
      )}

      <div>
        <label className="block text-xs opacity-60 mb-1">アクセントカラー</label>
        <div className="flex items-center gap-2">
          <input type="color" value={theme.accentColor}
            onChange={(e) => updateTheme({ accentColor: e.target.value })}
            className="w-10 h-8 rounded cursor-pointer bg-transparent border-0" />
          <div className="flex gap-1.5">
            {['#38bdf8', '#a78bfa', '#34d399', '#f472b6', '#fb923c', '#facc15'].map((c) => (
              <button key={c} onClick={() => updateTheme({ accentColor: c })}
                className="w-5 h-5 rounded-full border-2 transition-all"
                style={{ background: c, borderColor: theme.accentColor === c ? 'white' : 'transparent' }} />
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs opacity-60 mb-1">テキストカラー</label>
        <div className="flex items-center gap-2">
          <input type="color" value={theme.textColor}
            onChange={(e) => updateTheme({ textColor: e.target.value })}
            className="w-10 h-8 rounded cursor-pointer bg-transparent border-0" />
          <div className="flex gap-1.5">
            {['#f1f5f9', '#ffffff', '#e2e8f0', '#fef3c7', '#d1fae5'].map((c) => (
              <button key={c} onClick={() => updateTheme({ textColor: c })}
                className="w-5 h-5 rounded-full border-2 transition-all"
                style={{ background: c, borderColor: theme.textColor === c ? theme.accentColor : 'rgba(255,255,255,0.2)' }} />
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs opacity-60 mb-1">
          ウィジェット背景透明度 ({Math.round(theme.widgetBgOpacity * 100)}%)
        </label>
        <input type="range" min="0" max="0.8" step="0.05"
          value={theme.widgetBgOpacity}
          onChange={(e) => updateTheme({ widgetBgOpacity: parseFloat(e.target.value) })}
          className="w-full accent-[var(--dash-accent)]" />
      </div>

      <div className="flex items-center justify-between">
        <label className="text-xs opacity-60">ガラス効果 (blur)</label>
        <button
          onClick={() => updateTheme({ widgetBlur: !theme.widgetBlur })}
          className={`relative w-10 h-5 rounded-full transition-colors ${theme.widgetBlur ? '' : 'bg-white/20'}`}
          style={theme.widgetBlur ? { background: 'var(--dash-accent, #38bdf8)' } : {}}
        >
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${theme.widgetBlur ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>
    </div>
  );
}

function WidgetConfigEditor({ widgetId }: { widgetId: string }) {
  const widget = useDashboardStore((s) => s.config.widgets.find((w) => w.id === widgetId));
  const updateWidgetConfig = useDashboardStore((s) => s.updateWidgetConfig);

  if (!widget) return null;

  switch (widget.type) {
    case 'clock': {
      const c = widget.config as ClockConfig;
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs opacity-60">秒を表示</label>
            <ToggleSwitch checked={c.showSeconds} onChange={(v) => updateWidgetConfig(widgetId, { showSeconds: v })} />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs opacity-60">日付を表示</label>
            <ToggleSwitch checked={c.showDate} onChange={(v) => updateWidgetConfig(widgetId, { showDate: v })} />
          </div>
          <div>
            <label className="block text-xs opacity-60 mb-1">時刻フォーマット</label>
            <div className="flex gap-2">
              {(['24h', '12h'] as const).map((f) => (
                <button key={f} onClick={() => updateWidgetConfig(widgetId, { format: f })}
                  className={`flex-1 py-1.5 rounded-lg text-xs ${c.format === f ? 'font-semibold' : 'opacity-60 bg-white/10'}`}
                  style={c.format === f ? { background: 'var(--dash-accent, #38bdf8)', color: '#0f172a' } : {}}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs opacity-60 mb-1">フォントスタイル</label>
            <div className="flex gap-2">
              {(['default', 'mono', 'serif'] as const).map((f) => (
                <button key={f} onClick={() => updateWidgetConfig(widgetId, { fontStyle: f })}
                  className={`flex-1 py-1.5 rounded-lg text-xs ${c.fontStyle === f ? 'font-semibold' : 'opacity-60 bg-white/10'}`}
                  style={c.fontStyle === f ? { background: 'var(--dash-accent, #38bdf8)', color: '#0f172a' } : {}}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }
    case 'weather': {
      const c = widget.config as WeatherConfig;
      return <WeatherCityPicker config={c} widgetId={widgetId} updateWidgetConfig={updateWidgetConfig} />;
    }
    case 'countdown': {
      const c = widget.config as CountdownConfig;
      return (
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs opacity-60 mb-1">ラベル</label>
            <input value={c.label} onChange={(e) => updateWidgetConfig(widgetId, { label: e.target.value })}
              className="w-full bg-white/10 rounded-lg px-2 py-1.5 text-xs outline-none border border-white/10 focus:border-white/30" />
          </div>
          <div>
            <label className="block text-xs opacity-60 mb-1">目標日</label>
            <input type="date" value={c.targetDate.slice(0, 10)}
              onChange={(e) => updateWidgetConfig(widgetId, { targetDate: e.target.value })}
              className="w-full bg-white/10 rounded-lg px-2 py-1.5 text-xs outline-none border border-white/10 focus:border-white/30" />
          </div>
        </div>
      );
    }
    case 'pomodoro': {
      const c = widget.config as PomodoroConfig;
      return (
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs opacity-60 mb-1">作業時間（分）</label>
            <input type="number" min="1" max="60" value={c.workMinutes}
              onChange={(e) => updateWidgetConfig(widgetId, { workMinutes: parseInt(e.target.value) })}
              className="w-full bg-white/10 rounded-lg px-2 py-1.5 text-xs outline-none border border-white/10 focus:border-white/30" />
          </div>
          <div>
            <label className="block text-xs opacity-60 mb-1">休憩時間（分）</label>
            <input type="number" min="1" max="30" value={c.breakMinutes}
              onChange={(e) => updateWidgetConfig(widgetId, { breakMinutes: parseInt(e.target.value) })}
              className="w-full bg-white/10 rounded-lg px-2 py-1.5 text-xs outline-none border border-white/10 focus:border-white/30" />
          </div>
        </div>
      );
    }
    case 'text': {
      const c = widget.config as TextConfig;
      return (
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs opacity-60 mb-1">テキスト</label>
            <textarea value={c.content}
              onChange={(e) => updateWidgetConfig(widgetId, { content: e.target.value })}
              rows={4}
              className="w-full bg-white/10 rounded-lg px-2 py-1.5 text-xs outline-none border border-white/10 focus:border-white/30 resize-none" />
          </div>
          <div>
            <label className="block text-xs opacity-60 mb-1">文字サイズ</label>
            <div className="flex gap-1">
              {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
                <button key={s} onClick={() => updateWidgetConfig(widgetId, { fontSize: s })}
                  className={`flex-1 py-1.5 rounded-lg text-xs ${c.fontSize === s ? 'font-semibold' : 'opacity-60 bg-white/10'}`}
                  style={c.fontSize === s ? { background: 'var(--dash-accent, #38bdf8)', color: '#0f172a' } : {}}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }
    case 'progress': {
      const c = widget.config as ProgressConfig;
      const options = ['year', 'month', 'week', 'day'] as const;
      const labels = { year: '今年', month: '今月', week: '今週', day: '今日' };
      return (
        <div className="flex flex-col gap-2">
          <label className="text-xs opacity-60">表示する項目</label>
          {options.map((opt) => (
            <div key={opt} className="flex items-center justify-between">
              <span className="text-xs">{labels[opt]}</span>
              <ToggleSwitch
                checked={c.show.includes(opt)}
                onChange={(v) => {
                  const next = v ? [...c.show, opt] : c.show.filter((x) => x !== opt);
                  updateWidgetConfig(widgetId, { show: next });
                }}
              />
            </div>
          ))}
        </div>
      );
    }
    case 'bookmarks': {
      const c = widget.config as BookmarksConfig;
      return (
        <div className="flex flex-col gap-2">
          {c.items.map((item, i) => (
            <div key={item.id} className="flex gap-1 items-center">
              <input value={item.emoji} onChange={(e) => {
                const items = [...c.items];
                items[i] = { ...item, emoji: e.target.value };
                updateWidgetConfig(widgetId, { items });
              }} className="w-8 bg-white/10 rounded px-1 py-1 text-xs outline-none text-center" />
              <input value={item.label} onChange={(e) => {
                const items = [...c.items];
                items[i] = { ...item, label: e.target.value };
                updateWidgetConfig(widgetId, { items });
              }} placeholder="名前" className="flex-1 bg-white/10 rounded px-2 py-1 text-xs outline-none" />
              <input value={item.url} onChange={(e) => {
                const items = [...c.items];
                items[i] = { ...item, url: e.target.value };
                updateWidgetConfig(widgetId, { items });
              }} placeholder="URL" className="flex-1 bg-white/10 rounded px-2 py-1 text-xs outline-none" />
              <button onClick={() => updateWidgetConfig(widgetId, { items: c.items.filter((_, j) => j !== i) })}
                className="text-xs opacity-50 hover:opacity-80 px-1">✕</button>
            </div>
          ))}
          <button onClick={() => updateWidgetConfig(widgetId, {
            items: [...c.items, { id: Date.now().toString(), label: '', url: '', emoji: '🔗' }]
          })} className="py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/20">
            + リンクを追加
          </button>
        </div>
      );
    }
    case 'world-clock': {
      const c = widget.config as WorldClockConfig;
      return <WorldClockCityPicker config={c} widgetId={widgetId} updateWidgetConfig={updateWidgetConfig} />;
    }
    default:
      return <p className="text-xs opacity-50">設定項目はありません</p>;
  }
}

function CityPicker({
  selectedLabel,
  onSelect,
  excludeLabels,
}: {
  selectedLabel?: string;
  onSelect: (city: GeoResult) => void;
  excludeLabels?: string[];
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchCities(query);
        setResults(data.filter((r) => !excludeLabels?.includes(r.name)));
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="都市名を入力（例: 東京、Osaka）"
          className="w-full bg-white/10 rounded-lg px-2 py-1.5 pr-6 text-xs outline-none border border-white/10 focus:border-white/30 placeholder:opacity-40"
        />
        {loading && (
          <Loader2 size={11} className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin opacity-50" />
        )}
      </div>

      {results.length > 0 && (
        <div className="max-h-48 overflow-y-auto rounded-lg border border-white/10 divide-y divide-white/5">
          {results.map((city) => {
            const isSelected = city.name === selectedLabel;
            const sub = [city.admin1, city.country].filter(Boolean).join(' · ');
            return (
              <button
                key={city.id}
                onClick={() => { onSelect(city); setQuery(''); setResults([]); }}
                className="w-full flex items-center justify-between px-2 py-1.5 text-left text-xs"
                style={{ background: isSelected ? 'rgba(56,189,248,0.18)' : 'transparent' }}
                onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <span className={isSelected ? 'font-semibold' : ''}>{city.name}</span>
                <span className="opacity-40 text-[10px]">{sub}</span>
              </button>
            );
          })}
        </div>
      )}
      {query.trim().length >= 2 && !loading && results.length === 0 && (
        <p className="text-[11px] opacity-40 text-center py-1">見つかりません</p>
      )}
      {query.trim().length < 2 && (
        <p className="text-[11px] opacity-30 text-center py-1">2文字以上入力してください</p>
      )}
    </div>
  );
}

function WeatherCityPicker({
  config,
  widgetId,
  updateWidgetConfig,
}: {
  config: WeatherConfig;
  widgetId: string;
  updateWidgetConfig: (id: string, config: Partial<WeatherConfig>) => void;
}) {
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState('');

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocateError('このブラウザは位置情報に対応していません');
      return;
    }
    setLocating(true);
    setLocateError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let cityName = '現在地';
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ja`,
            { headers: { 'User-Agent': 'dashboard/1.0' } }
          );
          const data = await res.json();
          const a = data.address;
          cityName = a.city || a.town || a.village || a.county || a.state || '現在地';
        } catch { /* 失敗時はデフォルト */ }
        updateWidgetConfig(widgetId, { latitude, longitude, cityName });
        setLocating(false);
      },
      (err) => {
        setLocateError(err.code === 1 ? '位置情報の許可が必要です' : '位置情報を取得できませんでした');
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-xs opacity-60 mb-1">場所</label>
        <button
          onClick={useCurrentLocation}
          disabled={locating}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors"
          style={{ background: 'var(--dash-accent, #38bdf8)', color: '#0f172a' }}
        >
          {locating
            ? <><Loader2 size={12} className="animate-spin" /> 取得中…</>
            : <><LocateFixed size={12} /> 現在地を使用</>
          }
        </button>
        {locateError && <p className="text-[10px] text-red-400 mt-1">{locateError}</p>}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[10px] opacity-40">または都市を選択</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <div>
        <p className="text-[11px] opacity-50 mb-1">現在: {config.cityName}</p>
        <CityPicker
          selectedLabel={config.cityName}
          onSelect={(city) => {
            updateWidgetConfig(widgetId, {
              cityName: city.name,
              latitude: city.latitude,
              longitude: city.longitude,
            });
          }}
        />
      </div>

      <details className="group">
        <summary className="text-[11px] opacity-40 cursor-pointer hover:opacity-70 list-none flex items-center gap-1">
          <span className="group-open:rotate-90 inline-block transition-transform">›</span>
          緯度・経度で直接指定
        </summary>
        <div className="flex gap-2 mt-2">
          <div className="flex-1">
            <label className="block text-[10px] opacity-50 mb-0.5">緯度</label>
            <input type="number" value={config.latitude} step="0.0001"
              onChange={(e) => updateWidgetConfig(widgetId, { latitude: parseFloat(e.target.value) })}
              className="w-full bg-white/10 rounded px-2 py-1 text-xs outline-none border border-white/10 focus:border-white/30" />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] opacity-50 mb-0.5">経度</label>
            <input type="number" value={config.longitude} step="0.0001"
              onChange={(e) => updateWidgetConfig(widgetId, { longitude: parseFloat(e.target.value) })}
              className="w-full bg-white/10 rounded px-2 py-1 text-xs outline-none border border-white/10 focus:border-white/30" />
          </div>
        </div>
      </details>

      <div>
        <label className="block text-xs opacity-60 mb-1">温度単位</label>
        <div className="flex gap-2">
          {(['celsius', 'fahrenheit'] as const).map((u) => (
            <button key={u} onClick={() => updateWidgetConfig(widgetId, { unit: u })}
              className={`flex-1 py-1.5 rounded-lg text-xs ${config.unit === u ? 'font-semibold' : 'opacity-60 bg-white/10'}`}
              style={config.unit === u ? { background: 'var(--dash-accent, #38bdf8)', color: '#0f172a' } : {}}>
              {u === 'celsius' ? '°C' : '°F'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <label className="text-xs opacity-60">予報を表示</label>
        <ToggleSwitch checked={config.showForecast} onChange={(v) => updateWidgetConfig(widgetId, { showForecast: v })} />
      </div>
    </div>
  );
}

function WorldClockCityPicker({
  config,
  widgetId,
  updateWidgetConfig,
}: {
  config: WorldClockConfig;
  widgetId: string;
  updateWidgetConfig: (id: string, config: Partial<WorldClockConfig>) => void;
}) {
  const [addingTz, setAddingTz] = useState(false);

  const addCity = async (city: GeoResult) => {
    const already = config.timezones.some((t) => t.label === city.name);
    if (already) return;
    setAddingTz(true);
    const tz = city.timezone ?? await getTimezone(city.latitude, city.longitude);
    setAddingTz(false);
    updateWidgetConfig(widgetId, {
      timezones: [...config.timezones, { tz, label: city.name }],
    });
  };

  const removeCity = (label: string) => {
    updateWidgetConfig(widgetId, {
      timezones: config.timezones.filter((t) => t.label !== label),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-xs opacity-60 mb-1">表示中 ({config.timezones.length})</label>
        <div className="flex flex-col gap-1">
          {config.timezones.map((t) => (
            <div key={t.label} className="flex items-center justify-between px-2 py-1 rounded-lg text-xs"
              style={{ background: 'rgba(255,255,255,0.08)' }}>
              <span>{t.label}</span>
              <button onClick={() => removeCity(t.label)} className="opacity-40 hover:opacity-80 ml-2">✕</button>
            </div>
          ))}
          {config.timezones.length === 0 && (
            <p className="text-xs opacity-30 text-center py-1">都市を追加してください</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs opacity-60 mb-1">都市を追加</label>
        {addingTz && (
          <p className="text-[11px] opacity-50 flex items-center gap-1 mb-1">
            <Loader2 size={10} className="animate-spin" /> タイムゾーン取得中…
          </p>
        )}
        <CityPicker
          onSelect={addCity}
          excludeLabels={config.timezones.map((t) => t.label)}
        />
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors ${!checked ? 'bg-white/20' : ''}`}
      style={checked ? { background: 'var(--dash-accent, #38bdf8)' } : {}}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

export function DashboardSettings() {
  const isOpen = useDashboardStore((s) => s.isSettingsOpen);
  const setOpen = useDashboardStore((s) => s.setSettingsOpen);
  const addWidget = useDashboardStore((s) => s.addWidget);
  const editingId = useDashboardStore((s) => s.editingWidgetId);
  const setEditingWidget = useDashboardStore((s) => s.setEditingWidget);
  const resetConfig = useDashboardStore((s) => s.resetConfig);
  const theme = useDashboardStore((s) => s.config.theme);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-y-0 right-0 w-72 flex flex-col z-50 overflow-hidden"
      style={{
        background: 'rgba(15,23,42,0.9)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        color: theme.textColor,
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          {editingId && (
            <button onClick={() => setEditingWidget(null)} className="text-sm opacity-60 hover:opacity-100">
              ←
            </button>
          )}
          <h2 className="text-sm font-semibold">
            {editingId ? 'ウィジェット設定' : '設定'}
          </h2>
        </div>
        <button onClick={() => { setOpen(false); setEditingWidget(null); }}
          className="text-lg opacity-60 hover:opacity-100">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {editingId ? (
          <WidgetConfigEditor widgetId={editingId} />
        ) : (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-3">ウィジェットを追加</h3>
              <div className="grid grid-cols-2 gap-2">
                {WIDGET_CATALOG.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => addWidget(item.type, item.defaultConfig)}
                    className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-left transition-colors"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; }}
                  >
                    <span className="text-base">{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-3">テーマ & 背景</h3>
              <ThemeSettings />
            </div>

            <div>
              <h3 className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-3">その他</h3>
              <button
                onClick={() => { if (confirm('設定をリセットしますか？')) resetConfig(); }}
                className="w-full py-2 rounded-lg text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300"
              >
                設定をリセット
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
