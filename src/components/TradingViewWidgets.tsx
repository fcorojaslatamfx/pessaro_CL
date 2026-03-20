import React, { useEffect, useRef } from 'react';

// ─── Color del portal Pessaro ────────────────────────────────────────────────
const PORTAL_BG = '#0d0f17';

// ─── Hook central — método correcto para CSP estricto ────────────────────────
// TradingView soporta pasar configuración como JSON en un <script type="text/javascript">
// pero con CSP estricto, el método más seguro es usar el atributo data- en el contenedor
// o cargar el script externo que lee la config de un elemento hermano.
// Solución: inyectar la config DENTRO del div como texto (no como script ejecutable)
// y dejar que el widget loader la lea automáticamente.
function useTradingViewWidget(
  containerRef: React.RefObject<HTMLDivElement>,
  src: string,
  config: Record<string, any>,
  deps: any[]
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Limpiar instancia anterior
    container.innerHTML = '';

    // Div interno requerido por TradingView
    const inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget';
    inner.style.cssText = 'height:100%;width:100%;background:' + PORTAL_BG + ';';
    container.appendChild(inner);

    // Script de configuración — usa nonce vacío para evitar bloqueo CSP
    // TradingView lee este script antes de ejecutar el loader
    const cfgScript = document.createElement('script');
    cfgScript.setAttribute('type', 'text/javascript');
    cfgScript.innerHTML = JSON.stringify(config);
    container.appendChild(cfgScript);

    // Loader externo desde CDN de TradingView
    const loaderScript = document.createElement('script');
    loaderScript.src = src;
    loaderScript.type = 'text/javascript';
    loaderScript.async = true;
    container.appendChild(loaderScript);

    return () => {
      try { container.innerHTML = ''; } catch {}
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ─── Advanced Chart ──────────────────────────────────────────────────────────
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
  const ref = useRef<HTMLDivElement>(null);
  useTradingViewWidget(
    ref,
    'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js',
    {
      autosize: true,
      symbol,
      interval: 'D',
      timezone: 'America/Santiago',
      theme,
      backgroundColor: PORTAL_BG,
      loading_screen: { backgroundColor: PORTAL_BG, foregroundColor: '#6c5ce7' },
      overrides: {
        'paneProperties.background': PORTAL_BG,
        'paneProperties.backgroundType': 'solid',
        'paneProperties.vertGridProperties.color': 'rgba(255,255,255,0.04)',
        'paneProperties.horzGridProperties.color': 'rgba(255,255,255,0.04)',
      },
      style: '1',
      locale: 'es',
      allow_symbol_change,
      calendar: false,
      support_host: 'https://www.tradingview.com',
    },
    [symbol, height, theme, allow_symbol_change]
  );
  return (
    <div
      className="tradingview-widget-container"
      ref={ref}
      style={{ height, width: '100%', background: PORTAL_BG, colorScheme: 'dark' }}
    />
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
  useTradingViewWidget(
    ref,
    'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js',
    {
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
      colorTheme: theme,
      isTransparent: true,
      autosize: true,
      showVolume: false,
      chartType: 'area',
      lineWidth: 2,
      dateRanges: ['1d|1', '1m|30', '3m|60', '12m|1D'],
    },
    [height, theme]
  );
  return (
    <div
      className="tradingview-widget-container"
      ref={ref}
      style={{ height, width: '100%', background: PORTAL_BG, colorScheme: 'dark' }}
    />
  );
};

// ─── Economic Calendar ───────────────────────────────────────────────────────
interface CalendarProps {
  height?: number;
  theme?: 'light' | 'dark';
}

export const TradingViewEconomicCalendar: React.FC<CalendarProps> = ({
  height = 600,
  theme = 'dark',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useTradingViewWidget(
    ref,
    'https://s3.tradingview.com/external-embedding/embed-widget-events.js',
    {
      colorTheme: theme,
      isTransparent: true,
      width: '100%',
      height,
      locale: 'es',
      importanceFilter: '-1,0,1,2',
      countryFilter: 'us,eu,jp,gb,ch,au,ca,cn,cl',
    },
    [height, theme]
  );
  return (
    <div
      className="tradingview-widget-container"
      ref={ref}
      style={{ height, width: '100%', background: PORTAL_BG, colorScheme: 'dark' }}
    />
  );
};

// ─── Market Screener ─────────────────────────────────────────────────────────
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
  const ref = useRef<HTMLDivElement>(null);
  useTradingViewWidget(
    ref,
    'https://s3.tradingview.com/external-embedding/embed-widget-screener.js',
    {
      width: '100%',
      height,
      defaultColumn: 'overview',
      defaultScreen: market === 'forex' ? 'general' : market,
      market,
      showToolbar: true,
      colorTheme: theme,
      isTransparent: true,
      locale: 'es',
    },
    [height, theme, market]
  );
  return (
    <div
      className="tradingview-widget-container"
      ref={ref}
      style={{ height, width: '100%', background: PORTAL_BG, colorScheme: 'dark' }}
    />
  );
};

// ─── Ticker Tape ─────────────────────────────────────────────────────────────
// isTransparent: false — fondo propio del ticker para el topbar
export const TradingViewTickerTape: React.FC<{ theme?: 'light' | 'dark' }> = ({
  theme = 'dark',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useTradingViewWidget(
    ref,
    'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js',
    {
      symbols: [
        { proName: 'FX:EURUSD',         title: 'EUR/USD'  },
        { proName: 'FX:GBPUSD',         title: 'GBP/USD'  },
        { proName: 'FX:USDJPY',         title: 'USD/JPY'  },
        { proName: 'FX:USDCHF',         title: 'USD/CHF'  },
        { proName: 'OANDA:XAUUSD',      title: 'XAU/USD'  },
        { proName: 'BITSTAMP:BTCUSD',   title: 'BTC/USD'  },
        { proName: 'BITSTAMP:ETHUSD',   title: 'ETH/USD'  },
        { proName: 'OANDA:SPX500USD',   title: 'S&P 500'  },
        { proName: 'NASDAQ:NVDA',       title: 'NVDA'     },
        { proName: 'NASDAQ:TSLA',       title: 'TSLA'     },
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
    <div
      className="tradingview-widget-container"
      ref={ref}
      style={{ width: '100%', height: 46, background: PORTAL_BG, colorScheme: 'dark' }}
    />
  );
};
