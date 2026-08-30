import React, { useState, useRef, useMemo } from 'react';
import { PricePoint } from '../types';
import {
  TrendingUp,
  CandlestickChart,
  LineChart as LineChartIcon,
  Activity,
  Layers,
  BarChart2,
  Calendar
} from 'lucide-react';

interface InstitutionalPriceChartProps {
  symbol: string;
  currencySymbol?: string;
  data: PricePoint[];
  currentPrice?: number;
  timeframe: '1D' | '1W' | '1M' | '1Y';
  onTimeframeChange: (tf: '1D' | '1W' | '1M' | '1Y') => void;
  height?: number;
}

export const InstitutionalPriceChart: React.FC<InstitutionalPriceChartProps> = ({
  symbol,
  currencySymbol = '$',
  data,
  currentPrice,
  timeframe,
  onTimeframeChange,
  height = 260
}) => {
  const [chartType, setChartType] = useState<'area' | 'candles'>('area');
  const [showEMA, setShowEMA] = useState<boolean>(true);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const width = 800;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 20;
  const paddingBottom = showVolume ? 50 : 25;
  const chartHeight = height;

  // Process data points and indicators
  const points = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data;
  }, [data]);

  const { minPrice, maxPrice, priceRange, maxVolume } = useMemo(() => {
    if (points.length === 0) {
      return { minPrice: 100, maxPrice: 110, priceRange: 10, maxVolume: 1000000 };
    }
    const highs = points.map((p) => p.high || p.close);
    const lows = points.map((p) => p.low || p.close);
    const volumes = points.map((p) => p.volume || 10000);

    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const margin = (max - min) * 0.08 || 1;
    const maxVol = Math.max(...volumes) || 1000000;

    return {
      minPrice: min - margin,
      maxPrice: max + margin,
      priceRange: (max + margin) - (min - margin) || 1,
      maxVolume: maxVol
    };
  }, [points]);

  // Calculate 20-period EMA
  const emaPoints = useMemo(() => {
    if (points.length < 5) return [];
    const k = 2 / (20 + 1);
    let ema = points[0].close;
    return points.map((p, i) => {
      if (i === 0) {
        ema = p.close;
      } else {
        ema = p.close * k + ema * (1 - k);
      }
      const x = paddingLeft + (i / Math.max(1, points.length - 1)) * (width - paddingLeft - paddingRight);
      const y = paddingTop + (1 - (ema - minPrice) / priceRange) * (chartHeight - paddingTop - paddingBottom);
      return { x, y, value: ema };
    });
  }, [points, minPrice, priceRange, chartHeight, paddingLeft, paddingRight, paddingTop, paddingBottom]);

  // Calculate coordinates for area/line and candles
  const coords = useMemo(() => {
    return points.map((p, i) => {
      const x = paddingLeft + (i / Math.max(1, points.length - 1)) * (width - paddingLeft - paddingRight);
      const yClose = paddingTop + (1 - (p.close - minPrice) / priceRange) * (chartHeight - paddingTop - paddingBottom);
      const yOpen = paddingTop + (1 - ((p.open || p.close) - minPrice) / priceRange) * (chartHeight - paddingTop - paddingBottom);
      const yHigh = paddingTop + (1 - ((p.high || p.close) - minPrice) / priceRange) * (chartHeight - paddingTop - paddingBottom);
      const yLow = paddingTop + (1 - ((p.low || p.close) - minPrice) / priceRange) * (chartHeight - paddingTop - paddingBottom);
      const volHeight = ((p.volume || 0) / maxVolume) * 35;
      const isBull = p.close >= (p.open || p.close);

      return {
        x,
        yClose,
        yOpen,
        yHigh,
        yLow,
        volHeight,
        isBull,
        point: p
      };
    });
  }, [points, minPrice, priceRange, maxVolume, chartHeight, paddingLeft, paddingRight, paddingTop, paddingBottom]);

  // Area & Line Path
  const { linePath, areaPath } = useMemo(() => {
    if (coords.length === 0) return { linePath: '', areaPath: '' };
    const line = coords.reduce((acc, c, idx) => (idx === 0 ? `M ${c.x},${c.yClose}` : `${acc} L ${c.x},${c.yClose}`), '');
    const baselineY = chartHeight - paddingBottom;
    const area = `${line} L ${coords[coords.length - 1].x},${baselineY} L ${coords[0].x},${baselineY} Z`;
    return { linePath: line, areaPath: area };
  }, [coords, chartHeight, paddingBottom]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || coords.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * width;

    let closestIdx = 0;
    let closestDist = Infinity;
    coords.forEach((c, idx) => {
      const dist = Math.abs(c.x - svgX);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = idx;
      }
    });
    setHoverIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const activePoint = hoverIndex !== null && coords[hoverIndex] ? coords[hoverIndex] : (coords.length > 0 ? coords[coords.length - 1] : null);
  const firstClose = points[0]?.close || 1;
  const activeClose = activePoint?.point.close || currentPrice || firstClose;
  const pctChange = ((activeClose - firstClose) / firstClose) * 100;
  const isPositive = pctChange >= 0;

  return (
    <div className="space-y-2.5">
      {/* Chart Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#AD8B73]/20 pb-2.5 font-mono text-xs">
        {/* Left: Active Crosshair Telemetry */}
        <div className="flex items-center space-x-3 text-[11px]">
          {activePoint ? (
            <div className="flex items-center space-x-3 flex-wrap">
              <span className="font-bold text-[#3F2E22] bg-[#E3CAA5]/40 px-2 py-0.5 rounded">
                {activePoint.point.timestamp}
              </span>
              <span className="text-[#5C4433]">
                O: <strong className="text-[#3F2E22]">{currencySymbol}{(activePoint.point.open || activePoint.point.close).toFixed(2)}</strong>
              </span>
              <span className="text-[#5C4433]">
                H: <strong className="text-[#2D8A68]">{currencySymbol}{(activePoint.point.high || activePoint.point.close).toFixed(2)}</strong>
              </span>
              <span className="text-[#5C4433]">
                L: <strong className="text-[#A84236]">{currencySymbol}{(activePoint.point.low || activePoint.point.close).toFixed(2)}</strong>
              </span>
              <span className="text-[#5C4433]">
                C: <strong className="text-[#3F2E22] font-bold">{currencySymbol}{activePoint.point.close.toFixed(2)}</strong>
              </span>
              <span className={`font-bold ${isPositive ? 'text-[#2D8A68]' : 'text-[#A84236]'}`}>
                {isPositive ? '+' : ''}{pctChange.toFixed(2)}%
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#AD8B73]/15 text-[#5C4433]">
                {activePoint.point.regime_label || 'Quiet Bull'}
              </span>
            </div>
          ) : (
            <span className="text-[#8C705B] text-xs">Hover over chart for live OHLCV precision</span>
          )}
        </div>

        {/* Right: Chart View Options & Timeframe Selector */}
        <div className="flex items-center space-x-2">
          {/* Chart Style Switcher */}
          <div className="flex items-center space-x-1 bg-[#FFFBE9] p-0.5 rounded-lg border border-[#AD8B73]/25 shadow-warm-sm">
            <button
              type="button"
              onClick={() => setChartType('area')}
              title="Area / Line View"
              className={`p-1 rounded transition-all ${
                chartType === 'area' ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold' : 'text-[#5C4433] hover:bg-[#E3CAA5]/40'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('candles')}
              title="Candlestick View"
              className={`p-1 rounded transition-all ${
                chartType === 'candles' ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold' : 'text-[#5C4433] hover:bg-[#E3CAA5]/40'
              }`}
            >
              <CandlestickChart className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Indicator Toggles */}
          <div className="flex items-center space-x-1 text-[10px]">
            <button
              type="button"
              onClick={() => setShowEMA(!showEMA)}
              className={`px-2 py-0.5 rounded border transition-all ${
                showEMA ? 'bg-[#B8860B]/15 text-[#B8860B] border-[#B8860B]/30 font-bold' : 'bg-[#FFFBE9] text-[#8C705B] border-[#AD8B73]/20'
              }`}
            >
              EMA 20
            </button>
            <button
              type="button"
              onClick={() => setShowVolume(!showVolume)}
              className={`px-2 py-0.5 rounded border transition-all ${
                showVolume ? 'bg-[#2D8A68]/15 text-[#2D8A68] border-[#2D8A68]/30 font-bold' : 'bg-[#FFFBE9] text-[#8C705B] border-[#AD8B73]/20'
              }`}
            >
              Vol
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center space-x-1">
            {(['1D', '1W', '1M', '1Y'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => onTimeframeChange(tf)}
                className={`px-2 py-0.5 rounded transition-all text-[11px] ${
                  timeframe === tf
                    ? 'bg-[#AD8B73] text-[#FFFBE9] font-bold shadow-warm-sm'
                    : 'bg-[#FFFBE9] text-[#5C4433] hover:bg-[#E3CAA5]/40 border border-[#AD8B73]/20'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main SVG Interactive Graph */}
      <div ref={containerRef} className="relative bg-[#FFFBE9] rounded-xl border border-[#AD8B73]/20 shadow-warm-sm p-2 select-none">
        <svg
          viewBox={`0 0 ${width} ${chartHeight}`}
          className="w-full h-64 overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="areaGradientEmerald" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2D8A68" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#2D8A68" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="areaGradientAmber" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#AD8B73" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#AD8B73" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid & Price Ticks */}
          {[0.2, 0.5, 0.8].map((ratio, idx) => {
            const y = paddingTop + ratio * (chartHeight - paddingTop - paddingBottom);
            const pVal = maxPrice - ratio * priceRange;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#AD8B73"
                  strokeOpacity="0.15"
                  strokeDasharray="4,4"
                />
                <text
                  x={paddingLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fontFamily="monospace"
                  fill="#8C705B"
                >
                  {currencySymbol}{pVal.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Volume Histogram Bars */}
          {showVolume && coords.map((c, idx) => {
            const barWidth = Math.max(2, (width - paddingLeft - paddingRight) / coords.length - 2);
            const barY = chartHeight - 12 - c.volHeight;
            return (
              <rect
                key={`vol-${idx}`}
                x={c.x - barWidth / 2}
                y={barY}
                width={barWidth}
                height={c.volHeight}
                fill={c.isBull ? '#2D8A68' : '#A84236'}
                opacity={hoverIndex === idx ? 0.85 : 0.35}
              />
            );
          })}

          {/* Area & Line View */}
          {chartType === 'area' && linePath && (
            <>
              <path d={areaPath} fill="url(#areaGradientEmerald)" />
              <path d={linePath} fill="none" stroke="#2D8A68" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />

              {/* Regime Transition Points */}
              {coords.filter((_, idx) => idx % 5 === 0 || idx === coords.length - 1).map((c, idx) => {
                const color = c.point.regime_state === 0 ? '#2D8A68' : c.point.regime_state === 1 ? '#A84236' : '#B8860B';
                return (
                  <circle
                    key={`dot-${idx}`}
                    cx={c.x}
                    cy={c.yClose}
                    r={hoverIndex === idx ? '5' : '3.5'}
                    fill={color}
                    stroke="#FFFBE9"
                    strokeWidth="1.5"
                  />
                );
              })}
            </>
          )}

          {/* Candlestick View */}
          {chartType === 'candles' && coords.map((c, idx) => {
            const candleWidth = Math.max(3, (width - paddingLeft - paddingRight) / coords.length - 3);
            const bodyTop = Math.min(c.yOpen, c.yClose);
            const bodyHeight = Math.max(2, Math.abs(c.yOpen - c.yClose));
            const color = c.isBull ? '#2D8A68' : '#A84236';

            return (
              <g key={`candle-${idx}`}>
                {/* High/Low Wick */}
                <line
                  x1={c.x}
                  y1={c.yHigh}
                  x2={c.x}
                  y2={c.yLow}
                  stroke={color}
                  strokeWidth="1.2"
                />
                {/* Candle Body */}
                <rect
                  x={c.x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={c.isBull ? color : color}
                  stroke={color}
                  strokeWidth="1"
                  rx="1"
                />
              </g>
            );
          })}

          {/* EMA (20) Overlay Line */}
          {showEMA && emaPoints.length > 0 && (
            <path
              d={emaPoints.reduce((acc, p, idx) => (idx === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`), '')}
              fill="none"
              stroke="#B8860B"
              strokeWidth="1.5"
              strokeDasharray="4,3"
              strokeOpacity="0.85"
            />
          )}

          {/* Active Live Price Indicator Beacon (Right Edge) */}
          {coords.length > 0 && (
            <g transform={`translate(${coords[coords.length - 1].x}, ${coords[coords.length - 1].yClose})`}>
              <circle r="6" fill="#2D8A68" opacity="0.3" className="animate-ping" />
              <circle r="3.5" fill="#2D8A68" stroke="#FFFBE9" strokeWidth="1.5" />
            </g>
          )}

          {/* Crosshair Interactivity */}
          {hoverIndex !== null && coords[hoverIndex] && (
            <g>
              {/* Vertical Crosshair Line */}
              <line
                x1={coords[hoverIndex].x}
                y1={paddingTop}
                x2={coords[hoverIndex].x}
                y2={chartHeight - paddingBottom}
                stroke="#3F2E22"
                strokeOpacity="0.4"
                strokeDasharray="3,3"
                strokeWidth="1"
              />
              {/* Horizontal Crosshair Line */}
              <line
                x1={paddingLeft}
                y1={coords[hoverIndex].yClose}
                x2={width - paddingRight}
                y2={coords[hoverIndex].yClose}
                stroke="#3F2E22"
                strokeOpacity="0.4"
                strokeDasharray="3,3"
                strokeWidth="1"
              />
              {/* Active Point Circle Highlight */}
              <circle
                cx={coords[hoverIndex].x}
                cy={coords[hoverIndex].yClose}
                r="5"
                fill="#3F2E22"
                stroke="#FFFBE9"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Date Scale Axis */}
        <div className="flex justify-between text-[9px] font-mono text-[#8C705B] px-8 pt-1 border-t border-[#AD8B73]/15">
          <span>{points[0]?.timestamp || 'Start'}</span>
          <span>{points[Math.floor(points.length / 2)]?.timestamp || 'Mid'}</span>
          <span>{points[points.length - 1]?.timestamp || 'Live'}</span>
        </div>
      </div>
    </div>
  );
};
