'use client';

import { useEffect, useState } from 'react';
import type { QuoteConfig } from '@/lib/dashboard/types';

const BUILT_IN_QUOTES = [
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: '孔子' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: '千里の道も一歩から。', author: '老子' },
  { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs' },
  { text: '人生は自転車のようなものだ。バランスをとるためには、走り続けなければならない。', author: 'Albert Einstein' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { text: '今日という日は、残りの人生の最初の日である。', author: 'American Proverb' },
  { text: 'Be the change you wish to see in the world.', author: 'Mahatma Gandhi' },
];

export function QuoteWidget({ config }: { config: QuoteConfig }) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  const quotes =
    config.useCustomOnly && config.customQuotes.length > 0
      ? config.customQuotes.map((text) => ({ text, author: '' }))
      : [...BUILT_IN_QUOTES, ...config.customQuotes.map((text) => ({ text, author: '' }))];

  useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * quotes.length));
    const id = setInterval(() => setQuoteIndex(Math.floor(Math.random() * quotes.length)), 30_000);
    return () => clearInterval(id);
  }, [quotes.length]);

  const q = quotes[quoteIndex];

  return (
    <div className="flex flex-col justify-center h-full gap-0.5 cursor-pointer"
      onClick={() => setQuoteIndex(Math.floor(Math.random() * quotes.length))}>
      <p className="text-sm leading-snug opacity-85">&ldquo;{q.text}&rdquo;</p>
      {q.author && <p className="text-[10px] opacity-40 text-right">— {q.author}</p>}
    </div>
  );
}
