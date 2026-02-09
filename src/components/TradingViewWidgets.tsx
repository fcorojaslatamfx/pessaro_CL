import React, { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  symbol?: string;
  width?: string | number;
  height?: string | number;
  theme?: 'light' | 'dark';
  style?: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
  locale?: string;
  toolbar_bg?: string;
  enable_publishing?: boolean;
  allow_symbol_change?: boolean;
  container_id?: string;
}

// Widget de Gráfico Avanzado
export const TradingViewAdvancedChart: React.FC<TradingViewWidgetProps> = ({
  symbol = "EURUSD",
  width = "100%",
  height = 610,
  theme = "light",
  style = "1",
  locale = "es",
  toolbar_bg = "#f1f3f6",
  enable_publishing = false,
  allow_symbol_change = true,
  container_id = "tradingview_advanced"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Limpiar contenido previo
      containerRef.current.innerHTML = '';
      
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: false,
        symbol: symbol,
        interval: "D",
        timezone: "Etc/UTC",
        theme: theme,
        style: style,
        locale: locale,
        toolbar_bg: toolbar_bg,
        enable_publishing: enable_publishing,
        allow_symbol_change: allow_symbol_change,
        calendar: false,
        support_host: "https://www.tradingview.com",
        width: width,
        height: height
      });

      containerRef.current.appendChild(script);
    }
  }, [symbol, width, height, theme, style, locale, toolbar_bg, enable_publishing, allow_symbol_change]);

  return (
    <div className="tradingview-widget-container" style={{ height, width }}>
      <div ref={containerRef} id={container_id} style={{ height, width }}></div>
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
};

// Widget de Lista de Símbolos
export const TradingViewSymbolOverview: React.FC<{
  symbols?: Array<[string, string]>;
  width?: string | number;
  height?: string | number;
  theme?: 'light' | 'dark';
}> = ({
  symbols = [
    ["EURUSD", "EUR/USD"],
    ["GBPUSD", "GBP/USD"],
    ["USDJPY", "USD/JPY"],
    ["USDCHF", "USD/CHF"],
    ["AUDUSD", "AUD/USD"],
    ["USDCAD", "USD/CAD"]
  ],
  width = "100%",
  height = 400,
  theme = "light"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        symbols: symbols,
        chartOnly: false,
        width: width,
        height: height,
        locale: "es",
        colorTheme: theme,
        autosize: false,
        showVolume: false,
        showMA: false,
        hideDateRanges: false,
        hideMarketStatus: false,
        hideSymbolLogo: false,
        scalePosition: "right",
        scaleMode: "Normal",
        fontFamily: "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
        fontSize: "10",
        noTimeScale: false,
        valuesTracking: "1",
        changeMode: "price-and-percent",
        chartType: "area",
        maLineColor: "#2962FF",
        maLineWidth: 1,
        maLength: 9,
        lineWidth: 2,
        lineType: 0,
        dateRanges: [
          "1d|1",
          "1m|30",
          "3m|60",
          "12m|1D",
          "60m|1W",
          "all|1M"
        ]
      });

      containerRef.current.appendChild(script);
    }
  }, [symbols, width, height, theme]);

  return (
    <div className="tradingview-widget-container" style={{ height, width }}>
      <div ref={containerRef} style={{ height, width }}></div>
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
};

// Widget de Noticias Económicas
export const TradingViewEconomicCalendar: React.FC<{
  width?: string | number;
  height?: string | number;
  theme?: 'light' | 'dark';
}> = ({
  width = "100%",
  height = 400,
  theme = "light"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        colorTheme: theme,
        isTransparent: false,
        width: width,
        height: height,
        locale: "es",
        importanceFilter: "-1,0,1",
        countryFilter: "us,eu,jp,gb,ch,au,ca,nz,cn"
      });

      containerRef.current.appendChild(script);
    }
  }, [width, height, theme]);

  return (
    <div className="tradingview-widget-container" style={{ height, width }}>
      <div ref={containerRef} style={{ height, width }}></div>
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
};

// Widget de Screener de Mercado
export const TradingViewMarketScreener: React.FC<{
  width?: string | number;
  height?: string | number;
  theme?: 'light' | 'dark';
  market?: 'forex' | 'crypto' | 'america' | 'europe' | 'asia';
}> = ({
  width = "100%",
  height = 490,
  theme = "light",
  market = "forex"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        width: width,
        height: height,
        defaultColumn: "overview",
        defaultScreen: market,
        market: market,
        showToolbar: true,
        colorTheme: theme,
        locale: "es"
      });

      containerRef.current.appendChild(script);
    }
  }, [width, height, theme, market]);

  return (
    <div className="tradingview-widget-container" style={{ height, width }}>
      <div ref={containerRef} style={{ height, width }}></div>
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
};