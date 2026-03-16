import React, { useEffect, useRef } from 'react';

// ─── Helper ───────────────────────────────────────────────────────────────────
// TradingView requiere estructura exacta:
// <div class="tradingview-widget-container">
//   <div class="tradingview-widget-container__widget"></div>
//   <script type="text/javascript" src="...widget.js">{ config JSON }</script>
// </div>
//
// IMPORTANTE: el script carga el widget via src= y lee la config desde
// el contenido inline del mismo <script>. Algunos browsers ignoran
// innerHTML cuando src está presente → se usa un <script> separado
// con la config ANTES del script que carga el widget.

function useTradingViewScript(
  containerRef: React.RefObject<HTMLDivElement>,
  src: string,
  config: Record<string, any>,
  deps: any[]
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Limpiar instancia previa
    container.innerHTML = '';

    // Div inner requerido por TradingView
    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    widget.style.height = '100%';
    widget.style.width = '100%';
    container.appendChild(widget);

    // Script de configuración (ANTES del script que carga el widget)
    const configScript = document.createElement('script');
    configScript.type = 'text/javascript';
    configScript.text = JSON.stringify(config);
    container.appendChild(configScript);

    // Script que carga el widget real desde TradingView CDN
    const loaderScript = document.createElement('script');
    loaderScript.src = src;
    loaderScript.type = 'text/javascript';
    loaderScript.async = true;
    container.appendChild(loaderScript);

    return () => {
      if (container) container.innerHTML = '';
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ─── Advanced Chart ───────────────────────────────────────────────────────────
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

  useTradingViewScript(
    ref,
    'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js',
    {
      autosize: true,
      symbol,
      interval: 'D',
      timezone: 'America/Santiago',
      theme,
      style: '1',        // velas japonesas
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
      style={{ height, width: '100%' }}
    />
  );
};

// ─── Symbol Overview ──────────────────────────────────────────────────────────
interface SymbolOverviewProps {
  height?: number;
  theme?: 'light' | 'dark';
}

export const TradingViewSymbolOverview: React.FC<SymbolOverviewProps> = ({
  height = 200,
  theme = 'dark',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useTradingViewScript(
    ref,
    'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js',
    {
      symbols: [
        ['FX:EURUSD|1D'],
        ['FX:GBPUSD|1D'],
        ['OANDA:XAUUSD|1D'],
        ['BITSTAMP:BTCUSD|1D'],
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
    },
    [height, theme]
  );

  return (
    <div
      className="tradingview-widget-container"
      ref={ref}
      style={{ height, width: '100%' }}
    />
  );
};

// ─── Economic Calendar ────────────────────────────────────────────────────────
interface CalendarProps {
  height?: number;
  theme?: 'light' | 'dark';
}

export const TradingViewEconomicCalendar: React.FC<CalendarProps> = ({
  height = 600,
  theme = 'dark',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useTradingViewScript(
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
      style={{ height, width: '100%' }}
    />
  );
};

// ─── Market Screener ──────────────────────────────────────────────────────────
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

  useTradingViewScript(
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
      locale: 'es',
      isTransparent: true,
    },
    [height, theme, market]
  );

  return (
    <div
      className="tradingview-widget-container"
      ref={ref}
      style={{ height, width: '100%' }}
    />
  );
};

// ─── Ticker Tape ─────────────────────────────────────────────────────────────
export const TradingViewTickerTape: React.FC<{ theme?: 'light' | 'dark' }> = ({
  theme = 'dark',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useTradingViewScript(
    ref,
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
      isTransparent: false,
      displayMode: 'adaptive',
      locale: 'es',
    },
    [theme]
  );

  return (
    <div
      className="tradingview-widget-container"
      ref={ref}
      style={{ width: '100%', height: 46 }}
    />
  );
};
