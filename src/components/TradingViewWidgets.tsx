import React, { useEffect, useRef } from 'react';

// ─── Colores del portal Pessaro ───────────────────────────────────────────────
const PORTAL_BG = '#0d0f17';

// ─── Hook central ────────────────────────────────────────────────────────────
// La documentación oficial de TradingView requiere esta estructura exacta:
//   <div class="tradingview-widget-container">
//     <div class="tradingview-widget-container__widget"></div>
//     <script>{ JSON config }</script>   ← config ANTES del loader
//     <script src="...widget.js" async/> ← loader externo
//   </div>
//
// El loader lee la config desde el script anterior al ejecutarse.
// Fuente: https://www.tradingview.com/widget-docs/tutorials/iframe/build-page/widget-integration/

function useTradingViewScript(
  containerRef: React.RefObject<HTMLDivElement>,
  src: string,
  config: Record<string, any>,
  deps: any[]
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Destruir instancia anterior completamente
    container.innerHTML = '';

    // Div interno requerido por TradingView
    const inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget';
    inner.style.cssText = 'height:100%;width:100%;';
    container.appendChild(inner);

    // Script de configuración — DEBE ir antes del loader
    const cfgScript = document.createElement('script');
    cfgScript.type = 'text/javascript';
    cfgScript.text = JSON.stringify(config);
    container.appendChild(cfgScript);

    // Loader del widget desde TradingView CDN
    const loader = document.createElement('script');
    loader.src = src;
    loader.type = 'text/javascript';
    loader.async = true;
    container.appendChild(loader);

    return () => { if (container) container.innerHTML = ''; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ─── Advanced Chart ───────────────────────────────────────────────────────────
// Documentación tema oscuro:
//   theme: "dark"
//   backgroundColor: "#..." (color del toolbar / header)
//   loading_screen: { backgroundColor: "..." } (pantalla de carga)
//   overrides: { "paneProperties.background": "...", "paneProperties.backgroundType": "solid" }
// Fuente: https://www.tradingview.com/charting-library-docs/latest/customization/overrides/chart-overrides/
//
// Cambio de instrumento desde UI del widget:
//   allow_symbol_change: true — activa el buscador interno de TradingView
// Fuente: https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/

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
      autosize:             true,
      symbol,
      interval:             'D',
      timezone:             'America/Santiago',
      theme,
      // Fondo oscuro: establecido en 3 niveles según docs oficiales
      backgroundColor:      PORTAL_BG,          // toolbar/header
      loading_screen:       { backgroundColor: PORTAL_BG, foregroundColor: '#6c5ce7' },
      overrides: {
        // Fondo del canvas (pane) — requiere backgroundType: "solid"
        'paneProperties.background':     PORTAL_BG,
        'paneProperties.backgroundType': 'solid',
        // Grid sutil sobre fondo oscuro
        'paneProperties.vertGridProperties.color':  'rgba(255,255,255,0.04)',
        'paneProperties.horzGridProperties.color':  'rgba(255,255,255,0.04)',
      },
      style:                '1',               // Velas japonesas
      locale:               'es',
      // allow_symbol_change: true activa el buscador interno del widget
      allow_symbol_change,
      calendar:             false,
      support_host:         'https://www.tradingview.com',
    },
    [symbol, height, theme, allow_symbol_change]
  );

  return (
    <div
      className="tradingview-widget-container"
      ref={ref}
      style={{ height, width: '100%', background: PORTAL_BG }}
    />
  );
};

// ─── Symbol Overview ──────────────────────────────────────────────────────────
// Documentación tema oscuro: colorTheme + isTransparent
// Fuente: https://www.tradingview.com/widget-docs/widgets/charts/symbol-overview/

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
        ['EUR/USD', 'FX:EURUSD|1D'],
        ['GBP/USD', 'FX:GBPUSD|1D'],
        ['XAU/USD', 'OANDA:XAUUSD|1D'],
        ['BTC/USD', 'BITSTAMP:BTCUSD|1D'],
      ],
      chartOnly:    false,
      width:        '100%',
      height,
      locale:       'es',
      colorTheme:   theme,          // 'dark' — parámetro oficial para este widget
      isTransparent: true,          // fondo transparente → usa el color del contenedor
      autosize:     true,
      showVolume:   false,
      chartType:    'area',
      lineWidth:    2,
      dateRanges:   ['1d|1', '1m|30', '3m|60', '12m|1D'],
    },
    [height, theme]
  );

  return (
    <div
      className="tradingview-widget-container"
      ref={ref}
      style={{ height, width: '100%', background: PORTAL_BG }}
    />
  );
};

// ─── Economic Calendar ────────────────────────────────────────────────────────
// Parámetro de tema: colorTheme + isTransparent: true

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
      colorTheme:       theme,
      isTransparent:    true,
      width:            '100%',
      height,
      locale:           'es',
      importanceFilter: '-1,0,1,2',
      countryFilter:    'us,eu,jp,gb,ch,au,ca,cn,cl',
    },
    [height, theme]
  );

  return (
    <div
      className="tradingview-widget-container"
      ref={ref}
      style={{ height, width: '100%', background: PORTAL_BG }}
    />
  );
};

// ─── Market Screener ──────────────────────────────────────────────────────────
// Parámetros tema oscuro: colorTheme + isTransparent

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
      width:         '100%',
      height,
      defaultColumn: 'overview',
      defaultScreen: market === 'forex' ? 'general' : market,
      market,
      showToolbar:   true,
      colorTheme:    theme,
      isTransparent: true,
      locale:        'es',
    },
    [height, theme, market]
  );

  return (
    <div
      className="tradingview-widget-container"
      ref={ref}
      style={{ height, width: '100%', background: PORTAL_BG }}
    />
  );
};

// ─── Ticker Tape ──────────────────────────────────────────────────────────────
// isTransparent: false para mantener fondo propio del ticker en el topbar

export const TradingViewTickerTape: React.FC<{ theme?: 'light' | 'dark' }> = ({
  theme = 'dark',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useTradingViewScript(
    ref,
    'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js',
    {
      symbols: [
        { proName: 'FX:EURUSD',        title: 'EUR/USD'  },
        { proName: 'FX:GBPUSD',        title: 'GBP/USD'  },
        { proName: 'FX:USDJPY',        title: 'USD/JPY'  },
        { proName: 'FX:USDCHF',        title: 'USD/CHF'  },
        { proName: 'OANDA:XAUUSD',     title: 'XAU/USD'  },
        { proName: 'BITSTAMP:BTCUSD',  title: 'BTC/USD'  },
        { proName: 'BITSTAMP:ETHUSD',  title: 'ETH/USD'  },
        { proName: 'OANDA:SPX500USD',  title: 'S&P 500'  },
        { proName: 'NASDAQ:NVDA',      title: 'NVDA'     },
        { proName: 'NASDAQ:TSLA',      title: 'TSLA'     },
      ],
      showSymbolLogo: true,
      colorTheme:     theme,
      isTransparent:  false,
      displayMode:    'adaptive',
      locale:         'es',
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
