'use client';

import type { BookmarksConfig } from '@/lib/dashboard/types';

export function BookmarksWidget({ config }: { config: BookmarksConfig }) {
  return (
    <div className="flex flex-wrap gap-1 content-start h-full overflow-y-auto">
      {config.items.length === 0 && (
        <p className="text-xs opacity-30 w-full text-center mt-2">設定からリンクを追加</p>
      )}
      {config.items.map((item) => (
        <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors"
          style={{ background: 'rgba(255,255,255,0.08)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.16)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)'; }}>
          <span className="text-sm">{item.emoji || '🔗'}</span>
          <span className="truncate max-w-[100px]">{item.label}</span>
        </a>
      ))}
    </div>
  );
}
