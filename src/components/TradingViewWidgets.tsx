import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// TODOS los widgets usan iframe directo — método más confiable para fondo oscuro
// Las URLs de embed de TradingView aceptan parámetros de tema directamente
// eliminando dependencias de scripts inline o CSP
// ─────────────────────────────────────────────────────────────────────────────

const BG = '#0d0f17';

// ─── Estilo común para todos los iframes ─────────────────────────────────────
const iframeStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  border: 'none',
  background: BG,
  display: 'block',
};

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
  const src = `https://s.tradingview.com/widgetembed/?frameElementId=tv_chart`
    + `&symbol=${encodeURIComponent(symbol)}`
    + `&interval=D`
    + `&hidesidetoolbar=0`
    + `&symboledit=${allow_symbol_change ? 1 : 0}`
    + `&saveimage=1`
    + `&toolbarbg=0d0f17`
    + `&theme=${theme}`
    + `&style=1`
    + `&timezone=America%2FSantiago`
    + `&withdateranges=1`
    + `&hidevolume=0`
    + `&locale=es`;

  return (
    <div style={{ height, width: '100%', background: BG, borderRadius: 8, overflow: 'hidden' }}>
      <iframe key={symbol} src={src} style={iframeStyle} allowFullScreen title={`Chart ${symbol}`} />
    </div>
  );
};

// ─── Ticker Tape ──────────────────────────────────────────────────────────────
// URL embed del ticker tape con tema oscuro y transparencia
export const TradingViewTickerTape: React.FC<{ theme?: 'light' | 'dark' }> = ({
  theme = 'dark',
}) => {
  // Configuración del ticker codificada en el hash de la URL
  const config = {
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
  };

  const src = `https://s.tradingview.com/embed-widget/ticker-tape/?locale=es#${encodeURIComponent(JSON.stringify(config))}`;

  return (
    <div style={{ width: '100%', height: 52, background: BG, overflow: 'hidden' }}>
      <iframe src={src} style={{ ...iframeStyle, height: 52 }} title="Ticker Tape" />
    </div>
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
  const config = {
    width: '100%',
    height,
    defaultColumn: 'overview',
    defaultScreen: market === 'forex' ? 'general' : market,
    market,
    showToolbar: true,
    colorTheme: theme,
    isTransparent: true,
    locale: 'es',
  };

  const src = `https://s.tradingview.com/embed-widget/screener/?locale=es#${encodeURIComponent(JSON.stringify(config))}`;

  return (
    <div style={{ height, width: '100%', background: BG, overflow: 'hidden', borderRadius: 8 }}>
      <iframe src={src} style={iframeStyle} title="Market Screener" />
    </div>
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
  const config = {
    colorTheme: theme,
    isTransparent: true,
    width: '100%',
    height,
    locale: 'es',
    importanceFilter: '-1,0,1,2',
    countryFilter: 'us,eu,jp,gb,ch,au,ca,cn,cl',
  };

  const src = `https://s.tradingview.com/embed-widget/events/?locale=es#${encodeURIComponent(JSON.stringify(config))}`;

  return (
    <div style={{ height, width: '100%', background: BG, overflow: 'hidden', borderRadius: 8 }}>
      <iframe src={src} style={iframeStyle} title="Economic Calendar" />
    </div>
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
  const config = {
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
  };

  const src = `https://s.tradingview.com/embed-widget/symbol-overview/?locale=es#${encodeURIComponent(JSON.stringify(config))}`;

  return (
    <div style={{ height, width: '100%', background: BG, overflow: 'hidden', borderRadius: 8 }}>
      <iframe src={src} style={iframeStyle} title="Symbol Overview" />
    </div>
  );
};
