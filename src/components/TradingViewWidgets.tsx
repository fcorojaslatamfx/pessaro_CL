/**
 * TradingViewWidgets.tsx
 * Usa iframes oficiales de TradingView — único método garantizado que funciona
 * en todos los navegadores sin bloqueos CSP.
 * Twelve Data API: datos de precios en tiempo real para el portal.
 */
import React, { useEffect, useState, useRef } from 'react';

const TV_BASE = 'https://www.tradingview.com/widgetembed/';

// ─── Gráfico Avanzado ─────────────────────────────────────────────────────────
export const TradingViewAdvancedChart: React.FC<{
  symbol?: string;
  height?: number;
  theme?: 'light' | 'dark';
  allow_symbol_change?: boolean;
}> = ({ symbol = 'FX:EURUSD', height = 520, theme = 'dark', allow_symbol_change = true }) => {
  const params = new URLSearchParams({
    frameElementId: 'tradingview_chart',
    symbol,
    interval: 'D',
    timezone: 'America/Santiago',
    theme,
    style: '1',
    locale: 'es',
    toolbar_bg: theme === 'dark' ? '#0d0f17' : '#f1f3f6',
    enable_publishing: '0',
    allow_symbol_change: allow_symbol_change ? '1' : '0',
    calendar: '0',
    hide_side_toolbar: '0',
    withdateranges: '1',
    save_image: '0',
    studies: '',
    utm_source: 'pessaro.cl',
    utm_medium: 'widget',
  });

  return (
    <div style={{ height, width: '100%', borderRadius: 8, overflow: 'hidden' }}>
      <iframe
        id="tradingview_chart"
        src={`${TV_BASE}?${params.toString()}`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allowFullScreen
        title="TradingView Chart"
      />
    </div>
  );
};

// ─── Screener de Mercados ─────────────────────────────────────────────────────
export const TradingViewMarketScreener: React.FC<{
  height?: number;
  theme?: 'light' | 'dark';
  market?: string;
}> = ({ height = 500, theme = 'dark', market = 'forex' }) => {
  const src = `https://www.tradingview.com/embed-widget/screener/?locale=es#${encodeURIComponent(
    JSON.stringify({
      width: '100%',
      height,
      defaultColumn: 'overview',
      defaultScreen: market === 'forex' ? 'general' : market,
      market,
      showToolbar: true,
      colorTheme: theme,
      locale: 'es',
      isTransparent: true,
      utm_source: 'pessaro.cl',
      utm_medium: 'widget',
    })
  )}`;

  return (
    <div style={{ height, width: '100%', borderRadius: 8, overflow: 'hidden' }}>
      <iframe
        src={src}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Market Screener"
      />
    </div>
  );
};

// ─── Calendario Económico ─────────────────────────────────────────────────────
export const TradingViewEconomicCalendar: React.FC<{
  height?: number;
  theme?: 'light' | 'dark';
}> = ({ height = 600, theme = 'dark' }) => {
  const src = `https://www.tradingview.com/embed-widget/events/?locale=es#${encodeURIComponent(
    JSON.stringify({
      colorTheme: theme,
      isTransparent: true,
      width: '100%',
      height,
      locale: 'es',
      importanceFilter: '-1,0,1,2',
      countryFilter: 'us,eu,jp,gb,ch,au,ca,cn,cl',
      utm_source: 'pessaro.cl',
      utm_medium: 'widget',
    })
  )}`;

  return (
    <div style={{ height, width: '100%', borderRadius: 8, overflow: 'hidden' }}>
      <iframe
        src={src}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Economic Calendar"
      />
    </div>
  );
};

// ─── Symbol Overview (mini sparks) ───────────────────────────────────────────
export const TradingViewSymbolOverview: React.FC<{
  height?: number;
  theme?: 'light' | 'dark';
}> = ({ height = 200, theme = 'dark' }) => {
  const src = `https://www.tradingview.com/embed-widget/symbol-overview/?locale=es#${encodeURIComponent(
    JSON.stringify({
      symbols: [
        ['FX:EURUSD|1D'],
        ['FX:GBPUSD|1D'],
        ['OANDA:XAUUSD|1D'],
        ['BITSTAMP:BTCUSD|1D'],
        ['OANDA:SPX500USD|1D'],
      ],
      chartOnly: false,
      width: '100%',
      height,
      locale: 'es',
      colorTheme: theme,
      autosize: true,
      showVolume: false,
      chartType: 'area',
      lineWidth: 2,
      dateRanges: ['1d|1', '1m|30', '3m|60', '12m|1D'],
      utm_source: 'pessaro.cl',
      utm_medium: 'widget',
    })
  )}`;

  return (
    <div style={{ height, width: '100%', borderRadius: 8, overflow: 'hidden' }}>
      <iframe
        src={src}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Symbol Overview"
      />
    </div>
  );
};

// ─── Ticker Tape ─────────────────────────────────────────────────────────────
export const TradingViewTickerTape: React.FC<{
  theme?: 'light' | 'dark';
}> = ({ theme = 'dark' }) => {
  const src = `https://www.tradingview.com/embed-widget/ticker-tape/?locale=es#${encodeURIComponent(
    JSON.stringify({
      symbols: [
        { proName: 'FX:EURUSD', title: 'EUR/USD' },
        { proName: 'FX:GBPUSD', title: 'GBP/USD' },
        { proName: 'FX:USDJPY', title: 'USD/JPY' },
        { proName: 'OANDA:XAUUSD', title: 'XAU/USD' },
        { proName: 'BITSTAMP:BTCUSD', title: 'BTC/USD' },
        { proName: 'OANDA:SPX500USD', title: 'S&P 500' },
        { proName: 'FX:USDCLP', title: 'USD/CLP' },
      ],
      showSymbolLogo: true,
      colorTheme: theme,
      isTransparent: true,
      displayMode: 'adaptive',
      locale: 'es',
      utm_source: 'pessaro.cl',
      utm_medium: 'widget',
    })
  )}`;

  return (
    <div style={{ width: '100%', height: 46, overflow: 'hidden' }}>
      <iframe
        src={src}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Ticker Tape"
      />
    </div>
  );
};

// ─── Twelve Data Price Card ───────────────────────────────────────────────────
// Muestra precio en tiempo real usando Twelve Data API
const TWELVE_KEY = '6c1b8102beef4f668bbfef129df3bcf9';

interface PriceData {
  symbol: string;
  price: string;
  change: string;
  percent_change: string;
  is_market_open: boolean;
}

export const TwelveDataPriceCard: React.FC<{
  symbols?: string[];
}> = ({ symbols = ['EUR/USD', 'GBP/USD', 'XAU/USD', 'BTC/USD'] }) => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const fetchPrices = async () => {
    try {
      const symbolStr = symbols.join(',');
      const res = await fetch(
        `https://api.twelvedata.com/quote?symbol=${symbolStr}&apikey=${TWELVE_KEY}`
      );
      const data = await res.json();

      // Puede venir como objeto único o como {symbol: {...}}
      const results: PriceData[] = symbols.map(sym => {
        const d = symbols.length === 1 ? data : data[sym];
        if (!d || d.status === 'error') return null;
        return {
          symbol: sym,
          price: parseFloat(d.close || d.price || '0').toFixed(
            sym.includes('BTC') ? 0 : sym.includes('XAU') ? 2 : 5
          ),
          change: parseFloat(d.change || '0').toFixed(5),
          percent_change: parseFloat(d.percent_change || '0').toFixed(2),
          is_market_open: d.is_market_open ?? true,
        };
      }).filter(Boolean) as PriceData[];

      setPrices(results);
    } catch (e) {
      console.error('Twelve Data fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    intervalRef.current = setInterval(fetchPrices, 30000); // cada 30s
    return () => clearInterval(intervalRef.current);
  }, [symbols.join(',')]);

  if (loading) return (
    <div style={{ display: 'flex', gap: 12 }}>
      {symbols.map(s => (
        <div key={s} style={{ flex: 1, height: 80, borderRadius: 10,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%',
            border: '2px solid rgba(108,92,231,0.3)', borderTopColor: '#6c5ce7',
            animation: 'spin 1s linear infinite' }} />
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(symbols.length, 4)}, 1fr)`, gap: 12 }}>
      {prices.map(p => {
        const isPositive = parseFloat(p.percent_change) >= 0;
        const color = isPositive ? '#00d084' : '#ff4757';
        return (
          <div key={p.symbol} style={{
            borderRadius: 10, padding: '14px 16px',
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid rgba(255,255,255,0.07)`,
            borderLeft: `3px solid ${color}`,
          }}>
            <p style={{ fontSize: 11, color: '#636e72', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {p.symbol}
            </p>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#f1f2f6', letterSpacing: '-0.02em' }}>
              {p.price}
            </p>
            <p style={{ fontSize: 12, color, marginTop: 4, fontWeight: 500 }}>
              {isPositive ? '+' : ''}{p.percent_change}%
            </p>
          </div>
        );
      })}
    </div>
  );
};
