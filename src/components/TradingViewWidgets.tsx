import React, { useEffect, useRef } from 'react';

const BG = '#0d0f17';

// ─── Web Component loader ─────────────────────────────────────────────────────
// TradingView Web Components se cargan una sola vez y se reutilizan
function useWebComponentLoader(src: string) {
  useEffect(() => {
    if (document.querySelector(`script[src="${src}"]`)) return;
    const s = document.createElement('script');
    s.src = src;
    s.type = 'module';
    document.head.appendChild(s);
  }, [src]);
}

// ─── Advanced Chart — iframe directo (único que requiere este método) ─────────
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
  const src = `https://s.tradingview.com/widgetembed/?frameElementId=tv_chart&symbol=${encodeURIComponent(symbol)}&interval=D&hidesidetoolbar=0&symboledit=${allow_symbol_change ? 1 : 0}&saveimage=1&toolbarbg=0d0f17&theme=${theme}&style=1&timezone=America%2FSantiago&withdateranges=1&hidevolume=0&scaleposition=right&scaletype=normal&locale=es`;

  return (
    <div style={{ height, width: '100%', background: BG, borderRadius: 8, overflow: 'hidden' }}>
      <iframe
        key={symbol}
        src={src}
        style={{ width: '100%', height: '100%', border: 'none', background: BG }}
        allowFullScreen
        title={`TradingView ${symbol}`}
      />
    </div>
  );
};

// ─── Ticker Tape — Web Component ─────────────────────────────────────────────
// Usa <tv-ticker-tape> con theme="dark" como atributo nativo
// No requiere scripts inline — tema 100% controlado por CSS
export const TradingViewTickerTape: React.FC<{ theme?: 'light' | 'dark' }> = ({
  theme = 'dark',
}) => {
  useWebComponentLoader('https://s3.tradingview.com/tv.js');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = '';

    // Estructura iframe clásica pero con colorTheme dark y isTransparent
    const wrapper = document.createElement('div');
    wrapper.className = 'tradingview-widget-container';
    wrapper.style.cssText = `width:100%;height:46px;background:${BG};`;

    const inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget';
    wrapper.appendChild(inner);

    const cfg = document.createElement('script');
    cfg.type = 'text/javascript';
    cfg.textContent = JSON.stringify({
      symbols: [
        { proName: 'FX:EURUSD',       title: 'EUR/USD'  },
        { proName: 'FX:GBPUSD',       title: 'GBP/USD'  },
        { proName: 'FX:USDJPY',       title: 'USD/JPY'  },
        { proName: 'OANDA:XAUUSD',    title: 'XAU/USD'  },
        { proName: 'BITSTAMP:BTCUSD', title: 'BTC/USD'  },
        { proName: 'BITSTAMP:ETHUSD', title: 'ETH/USD'  },
        { proName: 'OANDA:SPX500USD', title: 'S&P 500'  },
        { proName: 'NASDAQ:NVDA',     title: 'NVDA'     },
        { proName: 'NASDAQ:TSLA',     title: 'TSLA'     },
      ],
      showSymbolLogo: true,
      colorTheme: 'dark',
      isTransparent: true,
      displayMode: 'adaptive',
      locale: 'es',
    });
    wrapper.appendChild(cfg);

    const loader = document.createElement('script');
    loader.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    loader.async = true;
    wrapper.appendChild(loader);

    el.appendChild(wrapper);
    return () => { try { el.innerHTML = ''; } catch {} };
  }, [theme]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%', height: 46,
        background: BG,
        colorScheme: 'dark',
      }}
    />
  );
};

// ─── Market Screener — iframe directo ────────────────────────────────────────
// El screener iframe acepta colorTheme y otros params por URL
interface ScreenerProps {
  height?: number;
  theme?: 'light' | 'dark';
  market?: 'forex' | 'crypto' | 'america' | 'europe' | 'asia';
}

export const TradingViewMarketScreener: React.FC<ScreenerProps> = ({
  height = 500,
  theme = 'dark',
  market = 'forex',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = '';

    const inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget';
    inner.style.cssText = `height:${height}px;width:100%;background:${BG};`;
    el.appendChild(inner);

    const cfg = document.createElement('script');
    cfg.type = 'text/javascript';
    cfg.textContent = JSON.stringify({
      width: '100%',
      height,
      defaultColumn: 'overview',
      defaultScreen: market === 'forex' ? 'general' : market,
      market,
      showToolbar: true,
      colorTheme: 'dark',
      isTransparent: true,
      locale: 'es',
    });
    el.appendChild(cfg);

    const loader = document.createElement('script');
    loader.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js';
    loader.async = true;
    el.appendChild(loader);

    return () => { try { el.innerHTML = ''; } catch {} };
  }, [height, theme, market]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ height, width: '100%', background: BG, colorScheme: 'dark' }}
    />
  );
};

// ─── Economic Calendar — iframe directo con URL params ───────────────────────
interface CalendarProps {
  height?: number;
  theme?: 'light' | 'dark';
}

export const TradingViewEconomicCalendar: React.FC<CalendarProps> = ({
  height = 600,
  theme = 'dark',
}) => {
  // URL directa del iframe del calendario con tema oscuro
  const src = `https://s.tradingview.com/embed-widget/events/?locale=es#%7B%22colorTheme%22%3A%22${theme}%22%2C%22isTransparent%22%3Atrue%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22${height}%22%2C%22importanceFilter%22%3A%22-1%2C0%2C1%2C2%22%2C%22countryFilter%22%3A%22us%2Ceu%2Cjp%2Cgb%2Cch%2Cau%2Cca%2Ccn%2Ccl%22%7D`;

  return (
    <div style={{ height, width: '100%', background: BG, colorScheme: 'dark', borderRadius: 8, overflow: 'hidden' }}>
      <iframe
        src={src}
        style={{ width: '100%', height: '100%', border: 'none', background: BG }}
        title="Economic Calendar"
      />
    </div>
  );
};

// ─── Symbol Overview ─────────────────────────────────────────────────────────
interface SymbolOverviewProps {
  height?: number;
  theme?: 'light' | 'dark';
}

export const TradingViewSymbolOverview: React.FC<SymbolOverviewProps> = ({
  height = 200,
  theme = 'dark',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = '';

    const inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget';
    inner.style.cssText = `height:${height}px;width:100%;background:${BG};`;
    el.appendChild(inner);

    const cfg = document.createElement('script');
    cfg.type = 'text/javascript';
    cfg.textContent = JSON.stringify({
      symbols: [
        ['EUR/USD', 'FX:EURUSD|1D'],
        ['GBP/USD', 'FX:GBPUSD|1D'],
        ['XAU/USD', 'OANDA:XAUUSD|1D'],
        ['BTC/USD', 'BITSTAMP:BTCUSD|1D'],
      ],
      chartOnly: false,
      width: '100%',
      height,
      locale: 'es',
      colorTheme: 'dark',
      isTransparent: true,
      autosize: true,
      showVolume: false,
      chartType: 'area',
    });
    el.appendChild(cfg);

    const loader = document.createElement('script');
    loader.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
    loader.async = true;
    el.appendChild(loader);

    return () => { try { el.innerHTML = ''; } catch {} };
  }, [height, theme]);

  return (
    <div
      ref={ref}
      className="tradingview-widget-container"
      style={{ height, width: '100%', background: BG, colorScheme: 'dark' }}
    />
  );
};
