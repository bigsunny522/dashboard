'use client';

import { useEffect, useRef, useState } from 'react';
import { Pencil, Settings2, Maximize2 } from 'lucide-react';
import { useDashboardStore } from '@/lib/dashboard/store';
import { DashboardGrid } from './DashboardGrid';
import { DashboardSettings } from './DashboardSettings';

import type { DashboardTheme } from '@/lib/dashboard/types';

function getBackground(theme: DashboardTheme): React.CSSProperties {
  switch (theme.backgroundType) {
    case 'gradient':
      return { background: `linear-gradient(${theme.gradientDirection}, ${theme.gradientFrom}, ${theme.gradientTo})` };
    case 'image': {
      const src = theme.backgroundImageBase64 || theme.backgroundImageUrl;
      return {
        backgroundImage: src ? `url(${src})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#0f172a',
      };
    }
    default:
      return { background: theme.backgroundColor };
  }
}

const GRID_ROWS = 12;
const GRID_MARGIN = 8;
const GRID_PADDING = 12;

function calcRowHeight(containerHeight: number): number {
  return Math.max(
    40,
    Math.floor((containerHeight - GRID_PADDING * 2 - (GRID_ROWS - 1) * GRID_MARGIN) / GRID_ROWS)
  );
}

export function DashboardClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1280);
  const [rowHeight, setRowHeight] = useState(80);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isEditMode = useDashboardStore((s) => s.isEditMode);
  const isSettingsOpen = useDashboardStore((s) => s.isSettingsOpen);
  const toggleEditMode = useDashboardStore((s) => s.toggleEditMode);
  const setSettingsOpen = useDashboardStore((s) => s.setSettingsOpen);
  const theme = useDashboardStore((s) => s.config.theme);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      setWidth(el.clientWidth);
      setRowHeight(calcRowHeight(window.innerHeight));
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    update();
    return () => { ro.disconnect(); window.removeEventListener('resize', update); };
  }, []);

  const bgStyle = getBackground(theme);
  const hasImage = theme.backgroundType === 'image' && (theme.backgroundImageBase64 || theme.backgroundImageUrl);

  const barBtnBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s, opacity 0.15s',
    background: 'transparent',
    pointerEvents: 'auto',
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden"
      style={{
        ...bgStyle,
        ['--dash-accent' as string]: theme.accentColor,
      }}
    >
      {hasImage && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `rgba(0,0,0,${theme.backgroundOverlayOpacity})` }}
        />
      )}

      <div className="relative z-10 h-full">
        <DashboardGrid width={width} rowHeight={rowHeight} maxRows={GRID_ROWS} />
      </div>

      {!isFullscreen && (
        <div
          className="fixed right-3 top-1/2 z-40 flex flex-col items-center gap-1 py-2 px-1.5"
          style={{
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 16,
            pointerEvents: 'none',
          }}
        >
          <button
            onClick={toggleEditMode}
            title={isEditMode ? '編集終了' : '編集'}
            style={{
              ...barBtnBase,
              color: isEditMode ? theme.accentColor : theme.textColor,
              background: isEditMode ? `${theme.accentColor}22` : 'transparent',
              opacity: isEditMode ? 1 : 0.55,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = isEditMode ? '1' : '0.55')}
          >
            <Pencil size={15} />
          </button>

          <div style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.12)' }} />

          <button
            onClick={() => {
              setSettingsOpen(!isSettingsOpen);
              if (isSettingsOpen) useDashboardStore.getState().setEditingWidget(null);
            }}
            title="設定"
            style={{
              ...barBtnBase,
              color: theme.textColor,
              background: isSettingsOpen ? 'rgba(255,255,255,0.15)' : 'transparent',
              opacity: isSettingsOpen ? 1 : 0.55,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = isSettingsOpen ? '1' : '0.55')}
          >
            <Settings2 size={15} />
          </button>

          <div style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.12)' }} />

          <button
            onClick={() => document.documentElement.requestFullscreen()}
            title="フルスクリーン"
            style={{ ...barBtnBase, color: theme.textColor, opacity: 0.55 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.55')}
          >
            <Maximize2 size={15} />
          </button>
        </div>
      )}

      <DashboardSettings />

      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-40 pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.2)' }}
        />
      )}
    </div>
  );
}
