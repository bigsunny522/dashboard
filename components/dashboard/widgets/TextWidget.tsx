'use client';

import type { TextConfig } from '@/lib/dashboard/types';

const SIZE_MAP = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-2xl',
};

const ALIGN_MAP = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function TextWidget({ config }: { config: TextConfig }) {
  return (
    <div className={`flex items-center h-full p-1 ${ALIGN_MAP[config.align]} ${SIZE_MAP[config.fontSize]} leading-relaxed whitespace-pre-wrap`}>
      {config.content || <span className="opacity-30">テキストなし</span>}
    </div>
  );
}
