'use client';

import { useEffect, useState } from 'react';
import type { WeatherConfig } from '@/lib/dashboard/types';

const WMO_CODES: Record<number, { label: string; emoji: string }> = {
  0: { label: '快晴', emoji: '☀️' },
  1: { label: '晴れ', emoji: '🌤️' },
  2: { label: '一部曇り', emoji: '⛅' },
  3: { label: '曇り', emoji: '☁️' },
  45: { label: '霧', emoji: '🌫️' },
  48: { label: '霧氷', emoji: '🌫️' },
  51: { label: '霧雨', emoji: '🌦️' },
  53: { label: '霧雨', emoji: '🌦️' },
  55: { label: '強い霧雨', emoji: '🌧️' },
  61: { label: '小雨', emoji: '🌧️' },
  63: { label: '雨', emoji: '🌧️' },
  65: { label: '大雨', emoji: '🌧️' },
  71: { label: '小雪', emoji: '🌨️' },
  73: { label: '雪', emoji: '❄️' },
  75: { label: '大雪', emoji: '❄️' },
  80: { label: 'にわか雨', emoji: '🌦️' },
  81: { label: 'にわか雨', emoji: '🌧️' },
  82: { label: '激しいにわか雨', emoji: '⛈️' },
  95: { label: '雷雨', emoji: '⛈️' },
  96: { label: '雷雨（ひょう）', emoji: '⛈️' },
  99: { label: '激しい雷雨', emoji: '⛈️' },
};

interface WeatherData {
  current: { temperature: number; weatherCode: number; windspeed: number; humidity: number };
  daily: { time: string[]; tempMax: number[]; tempMin: number[]; weatherCode: number[] };
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export function WeatherWidget({ config }: { config: WeatherConfig }) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        setLoading(true);
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${config.latitude}&longitude=${config.longitude}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=4`;
        const res = await fetch(url);
        const json = await res.json();
        setData({
          current: {
            temperature: Math.round(json.current.temperature_2m),
            weatherCode: json.current.weather_code,
            windspeed: Math.round(json.current.wind_speed_10m),
            humidity: json.current.relative_humidity_2m,
          },
          daily: {
            time: json.daily.time,
            tempMax: json.daily.temperature_2m_max.map(Math.round),
            tempMin: json.daily.temperature_2m_min.map(Math.round),
            weatherCode: json.daily.weather_code,
          },
        });
        setError(false);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
    const id = setInterval(fetch_, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [config.latitude, config.longitude]);

  const toUnit = (c: number) =>
    config.unit === 'fahrenheit' ? Math.round((c * 9) / 5 + 32) : c;
  const unit = config.unit === 'celsius' ? '°C' : '°F';

  if (loading) return <div className="flex items-center justify-center h-full text-xs opacity-40">取得中…</div>;
  if (error || !data) return <div className="flex items-center justify-center h-full text-xs opacity-40">取得失敗</div>;

  const current = WMO_CODES[data.current.weatherCode] ?? { label: '不明', emoji: '🌡️' };

  return (
    <div className="flex flex-col h-full gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-3xl leading-none">{current.emoji}</span>
        <div className="leading-none">
          <p className="text-2xl font-bold tabular-nums">{toUnit(data.current.temperature)}{unit}</p>
          <p className="text-[11px] opacity-50 mt-0.5">{config.cityName} · {current.label}</p>
        </div>
        <div className="ml-auto text-[10px] opacity-50 text-right leading-tight">
          <p>💨{data.current.windspeed}km/h</p>
          <p>💧{data.current.humidity}%</p>
        </div>
      </div>

      {config.showForecast && (
        <div className="flex gap-1 mt-auto">
          {data.daily.time.slice(0, 4).map((date, i) => {
            const d = new Date(date);
            const w = WMO_CODES[data.daily.weatherCode[i]] ?? { emoji: '🌡️' };
            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-0.5 rounded-lg py-1 text-center"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <span className="text-[10px] opacity-50 leading-none">{i === 0 ? '今日' : WEEKDAYS[d.getDay()]}</span>
                <span className="text-base leading-none">{w.emoji}</span>
                <span className="text-[11px] font-semibold leading-none">{toUnit(data.daily.tempMax[i])}{unit}</span>
                <span className="text-[10px] opacity-40 leading-none">{toUnit(data.daily.tempMin[i])}{unit}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
