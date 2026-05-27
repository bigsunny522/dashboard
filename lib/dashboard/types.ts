export type WidgetType =
  | 'clock'
  | 'weather'
  | 'world-clock'
  | 'calendar'
  | 'text'
  | 'todo'
  | 'countdown'
  | 'pomodoro'
  | 'progress'
  | 'bookmarks'
  | 'quote';

export interface WidgetLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface ClockConfig {
  showSeconds: boolean;
  format: '12h' | '24h';
  showDate: boolean;
  fontStyle: 'default' | 'mono' | 'serif';
}

export interface WeatherConfig {
  latitude: number;
  longitude: number;
  cityName: string;
  unit: 'celsius' | 'fahrenheit';
  showForecast: boolean;
}

export interface WorldClockConfig {
  timezones: Array<{ tz: string; label: string }>;
}

export interface TextConfig {
  content: string;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  align: 'left' | 'center' | 'right';
}

export interface TodoConfig {
  items: Array<{ id: string; text: string; done: boolean }>;
}

export interface CountdownConfig {
  targetDate: string;
  label: string;
}

export interface PomodoroConfig {
  workMinutes: number;
  breakMinutes: number;
}

export interface ProgressConfig {
  show: ('year' | 'month' | 'day' | 'week')[];
}

export interface BookmarksConfig {
  items: Array<{ id: string; label: string; url: string; emoji: string }>;
}

export interface QuoteConfig {
  customQuotes: string[];
  useCustomOnly: boolean;
}

export type WidgetConfig =
  | ClockConfig
  | WeatherConfig
  | WorldClockConfig
  | TextConfig
  | TodoConfig
  | CountdownConfig
  | PomodoroConfig
  | ProgressConfig
  | BookmarksConfig
  | QuoteConfig;

export interface Widget {
  id: string;
  type: WidgetType;
  config: WidgetConfig;
}

export type BackgroundType = 'color' | 'gradient' | 'image';

export interface DashboardTheme {
  backgroundType: BackgroundType;
  backgroundColor: string;
  gradientFrom: string;
  gradientTo: string;
  gradientDirection: string;
  backgroundImageUrl: string;
  backgroundImageBase64: string;
  backgroundBlur: number;
  backgroundOverlayOpacity: number;
  accentColor: string;
  widgetBgOpacity: number;
  widgetBlur: boolean;
  textColor: string;
}

export interface DashboardConfig {
  widgets: Widget[];
  layouts: WidgetLayout[];
  theme: DashboardTheme;
  cols: number;
  rowHeight: number;
}

export const DEFAULT_THEME: DashboardTheme = {
  backgroundType: 'color',
  backgroundColor: '#0f172a',
  gradientFrom: '#0f172a',
  gradientTo: '#1e3a5f',
  gradientDirection: 'to bottom right',
  backgroundImageUrl: '',
  backgroundImageBase64: '',
  backgroundBlur: 0,
  backgroundOverlayOpacity: 0.4,
  accentColor: '#38bdf8',
  widgetBgOpacity: 0.15,
  widgetBlur: true,
  textColor: '#f1f5f9',
};

export const DEFAULT_CONFIG: DashboardConfig = {
  widgets: [
    {
      id: 'clock-1',
      type: 'clock',
      config: {
        showSeconds: true,
        format: '24h',
        showDate: true,
        fontStyle: 'mono',
      } as ClockConfig,
    },
    {
      id: 'weather-1',
      type: 'weather',
      config: {
        latitude: 35.6762,
        longitude: 139.6503,
        cityName: '東京',
        unit: 'celsius',
        showForecast: true,
      } as WeatherConfig,
    },
    {
      id: 'calendar-1',
      type: 'calendar',
      config: {} as WidgetConfig,
    },
    {
      id: 'todo-1',
      type: 'todo',
      config: {
        items: [],
      } as TodoConfig,
    },
  ],
  layouts: [
    { i: 'clock-1',    x: 0, y: 0, w: 6, h: 6, minW: 3, minH: 2 },
    { i: 'weather-1',  x: 6, y: 0, w: 6, h: 6, minW: 4, minH: 3 },
    { i: 'calendar-1', x: 0, y: 6, w: 6, h: 6, minW: 3, minH: 3 },
    { i: 'todo-1',     x: 6, y: 6, w: 6, h: 6, minW: 3, minH: 3 },
  ],
  theme: DEFAULT_THEME,
  cols: 12,
  rowHeight: 80,
};
