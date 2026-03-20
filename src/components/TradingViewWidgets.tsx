import React, { useEffect, useRef, useState } from 'react';

const BG = '#0d0f17';

// ─── Advanced Chart — iframe directo ─────────────────────────────────────────
// Método más confiable: iframe con URL params de TradingView
// Elimina problemas de CSP, scripts inline y estado del widget
interface AdvancedChartProps {
  symbol?: string;
  height?: number;
  theme?: 'light' | 'dark';
  allow_symbol_change?: boolean;
}

export const TradingViewAdvancedChart: React.FC<AdvancedChartProps> = ({
  symbol = 'FX:EURUSD',
  height = 520,
  theme = 'dark',
  allow_symbol_change = true,
}) => {
  // key fuerza remount completo del iframe al cambiar símbolo
  const src = `https://s.tradingview.com/widgetembed/?frameElementId=tv_chart&symbol=${encodeURIComponent(symbol)}&interval=D&hidesidetoolbar=0&symboledit=${allow_symbol_change ? 1 : 0}&saveimage=1&toolbarbg=${BG.replace('#','')}&theme=${theme}&style=1&timezone=America%2FSantiago&withdateranges=1&hidevolume=0&scaleposition=right&scaletype=normal&locale=es&utm_source=pessaro.cl&utm_medium=widget`;

  return (
    <div style={{ height, width: '100%', background: BG, borderRadius: 8, overflow: 'hidden' }}>
      <iframe
        key={symbol}
        src={src}
        style={{ width: '100%', height: '100%', border: 'none', background: BG }}
        allowFullScreen
        title={`TradingView Chart ${symbol}`}
      />
    </div>
  );
};

// ─── Hook para widgets embed (ticker, screener, calendar) ─────────────────────
// Para widgets que NO necesitan cambio de símbolo usamos el método de script
// pero con textContent en vez de innerHTML para evitar el error "Unexpected token ':'"
function useTVWidget(
  ref: React.RefObject<HTMLDivElement>,
  src: string,
  config: object,
  deps: any[]
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.innerHTML = '';

    // Div interno requerido por TradingView
    const inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget';
    inner.style.cssText = `height:100%;width:100%;background:${BG};`;
    el.appendChild(inner);

    // Config como textContent — evita el error "Unexpected token ':'"
    const cfg = document.createElement('script');
    cfg.type = 'text/javascript';
    cfg.textContent = JSON.stringify(config);
    el.appendChild(cfg);

    // Loader externo
    const loader = document.createElement('script');
    loader.src = src;
    loader.async = true;
    el.appendChild(loader);

    return () => { try { el.innerHTML = ''; } catch {} };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ─── Ticker Tape ─────────────────────────────────────────────────────────────
export const TradingViewTickerTape: React.FC<{ theme?: 'light' | 'dark' }> = ({
  theme = 'dark',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useTVWidget(ref,
    'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js',
    {
      symbols: [
        { proName: 'FX:EURUSD',       title: 'EUR/USD'  },
        { proName: 'FX:GBPUSD',       title: 'GBP/USD'  },
        { proName: 'FX:USDJPY',       title: 'USD/JPY'  },
        { proName: 'FX:USDCHF',       title: 'USD/CHF'  },
        { proName: 'OANDA:XAUUSD',    title: 'XAU/USD'  },
        { proName: 'BITSTAMP:BTCUSD', title: 'BTC/USD'  },
        { proName: 'BITSTAMP:ETHUSD', title: 'ETH/USD'  },
        { proName: 'OANDA:SPX500USD', title: 'S&P 500'  },
        { proName: 'NASDAQ:NVDA',     title: 'NVDA'     },
        { proName: 'NASDAQ:TSLA',     title: 'TSLA'     },
      ],
      showSymbolLogo: true,
      colorTheme: theme,
      isTransparent: true,
      displayMode: 'adaptive',
      locale: 'es',
    },
    [theme]
  );
  return (
    <div ref={ref} className="tradingview-widget-container"
      style={{ width: '100%', height: 46, background: BG }} />
  );
};

// ─── Symbol Overview ─────────────────────────────────────────────────────────
interface SymbolOverviewProps { height?: number; theme?: 'light' | 'dark'; }
export const TradingViewSymbolOverview: React.FC<SymbolOverviewProps> = ({
  height = 200, theme = 'dark',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useTVWidget(ref,
    'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js',
    {
      symbols: [
        ['EUR/USD', 'FX:EURUSD|1D'],
        ['GBP/USD', 'FX:GBPUSD|1D'],
        ['XAU/USD', 'OANDA:XAUUSD|1D'],
        ['BTC/USD', 'BITSTAMP:BTCUSD|1D'],
      ],
      chartOnly: false, width: '100%', height, locale: 'es',
      colorTheme: theme, isTransparent: true,
      autosize: true, showVolume: false, chartType: 'area',
    },
    [height, theme]
  );
  return (
    <div ref={ref} className="tradingview-widget-container"
      style={{ height, width: '100%', background: BG }} />
  );
};

// ─── Economic Calendar ───────────────────────────────────────────────────────
interface CalendarProps { height?: number; theme?: 'light' | 'dark'; }
export const TradingViewEconomicCalendar: React.FC<CalendarProps> = ({
  height = 600, theme = 'dark',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useTVWidget(ref,
    'https://s3.tradingview.com/external-embedding/embed-widget-events.js',
    {
      colorTheme: theme, isTransparent: true,
      width: '100%', height, locale: 'es',
      importanceFilter: '-1,0,1,2',
      countryFilter: 'us,eu,jp,gb,ch,au,ca,cn,cl',
    },
    [height, theme]
  );
  return (
    <div ref={ref} className="tradingview-widget-container"
      style={{ height, width: '100%', background: BG }} />
  );
};

// ─── Market Screener ─────────────────────────────────────────────────────────
interface ScreenerProps {
  height?: number; theme?: 'light' | 'dark';
  market?: 'forex' | 'crypto' | 'america' | 'europe' | 'asia';
}
export const TradingViewMarketScreener: React.FC<ScreenerProps> = ({
  height = 500, theme = 'dark', market = 'forex',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useTVWidget(ref,
    'https://s3.tradingview.com/external-embedding/embed-widget-screener.js',
    {
      width: '100%', height,
      defaultColumn: 'overview',
      defaultScreen: market === 'forex' ? 'general' : market,
      market, showToolbar: true,
      colorTheme: theme, isTransparent: true, locale: 'es',
    },
    [height, theme, market]
  );
  return (
    <div ref={ref} className="tradingview-widget-container"
      style={{ height, width: '100%', background: BG }} />
  );
};
