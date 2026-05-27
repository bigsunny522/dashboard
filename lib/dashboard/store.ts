'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DashboardConfig,
  DashboardTheme,
  Widget,
  WidgetLayout,
  WidgetType,
  WidgetConfig,
} from './types';
import { DEFAULT_CONFIG } from './types';

let idCounter = Date.now();
const genId = (type: WidgetType) => `${type}-${++idCounter}`;

interface DashboardStore {
  config: DashboardConfig;
  isEditMode: boolean;
  isSettingsOpen: boolean;
  editingWidgetId: string | null;

  setLayouts: (layouts: WidgetLayout[]) => void;

  addWidget: (type: WidgetType, config: WidgetConfig) => void;
  removeWidget: (id: string) => void;
  updateWidgetConfig: (id: string, config: Partial<WidgetConfig>) => void;

  updateTheme: (theme: Partial<DashboardTheme>) => void;

  toggleEditMode: () => void;
  setSettingsOpen: (open: boolean) => void;
  setEditingWidget: (id: string | null) => void;

  resetConfig: () => void;
}

const DEFAULT_MIN: Record<WidgetType, { w: number; h: number }> = {
  clock: { w: 3, h: 2 },
  weather: { w: 4, h: 3 },
  'world-clock': { w: 3, h: 2 },
  calendar: { w: 3, h: 3 },
  text: { w: 2, h: 1 },
  todo: { w: 3, h: 3 },
  countdown: { w: 3, h: 2 },
  pomodoro: { w: 3, h: 3 },
  progress: { w: 3, h: 2 },
  bookmarks: { w: 3, h: 2 },
  quote: { w: 4, h: 2 },
};

const DEFAULT_SIZE: Record<WidgetType, { w: number; h: number }> = {
  clock: { w: 6, h: 4 },
  weather: { w: 6, h: 4 },
  'world-clock': { w: 4, h: 3 },
  calendar: { w: 4, h: 4 },
  text: { w: 4, h: 2 },
  todo: { w: 4, h: 4 },
  countdown: { w: 4, h: 3 },
  pomodoro: { w: 4, h: 4 },
  progress: { w: 4, h: 3 },
  bookmarks: { w: 4, h: 3 },
  quote: { w: 6, h: 3 },
};

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      isEditMode: false,
      isSettingsOpen: false,
      editingWidgetId: null,

      setLayouts: (layouts) =>
        set((s) => ({ config: { ...s.config, layouts } })),

      addWidget: (type, config) =>
        set((s) => {
          const id = genId(type);
          const size = DEFAULT_SIZE[type];
          const min = DEFAULT_MIN[type];
          const newLayout: WidgetLayout = {
            i: id,
            x: 0,
            y: Infinity,
            w: size.w,
            h: size.h,
            minW: min.w,
            minH: min.h,
          };
          return {
            config: {
              ...s.config,
              widgets: [...s.config.widgets, { id, type, config }],
              layouts: [...s.config.layouts, newLayout],
            },
          };
        }),

      removeWidget: (id) =>
        set((s) => ({
          config: {
            ...s.config,
            widgets: s.config.widgets.filter((w) => w.id !== id),
            layouts: s.config.layouts.filter((l) => l.i !== id),
          },
        })),

      updateWidgetConfig: (id, config) =>
        set((s) => ({
          config: {
            ...s.config,
            widgets: s.config.widgets.map((w) =>
              w.id === id ? { ...w, config: { ...w.config, ...config } as WidgetConfig } : w
            ),
          },
        })),

      updateTheme: (theme) =>
        set((s) => ({
          config: {
            ...s.config,
            theme: { ...s.config.theme, ...theme },
          },
        })),

      toggleEditMode: () => set((s) => ({ isEditMode: !s.isEditMode })),
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),
      setEditingWidget: (id) => set({ editingWidgetId: id }),

      resetConfig: () => set({ config: DEFAULT_CONFIG }),
    }),
    {
      name: 'dashboard-config',
    }
  )
);
