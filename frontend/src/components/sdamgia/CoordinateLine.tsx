import { useCallback, useRef, useState } from 'react';

export interface MarkedPoint {
  value: number;
  label: string;
}

interface CoordinateLineProps {
  value: number | null;
  onChange: (value: number) => void;
  range?: [number, number];
  step?: number;
  snapTo?: number;
  disabled?: boolean;
  markedPoints?: MarkedPoint[];
}

const SVG_WIDTH = 600;
const SVG_HEIGHT = 120;
const PADDING_X = 40;
const LINE_Y = 60;
const TICK_HALF = 10;
const MINOR_TICK_HALF = 5;

const POINT_COLORS = ['#dc2626', '#059669', '#d97706', '#7c3aed', '#0891b2', '#be185d'];

export default function CoordinateLine({
  value,
  onChange,
  range = [-1, 7],
  step = 1,
  snapTo = 0.1,
  disabled = false,
  markedPoints = [],
}: CoordinateLineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  const [min, max] = range;
  const usableWidth = SVG_WIDTH - PADDING_X * 2;

  const valueToX = useCallback(
    (v: number) => PADDING_X + ((v - min) / (max - min)) * usableWidth,
    [min, max, usableWidth]
  );

  const xToValue = useCallback(
    (x: number) => {
      const raw = min + ((x - PADDING_X) / usableWidth) * (max - min);
      const snapped = Math.round(raw / snapTo) * snapTo;
      return Math.max(min, Math.min(max, parseFloat(snapped.toFixed(2))));
    },
    [min, max, usableWidth, snapTo]
  );

  const getSVGX = useCallback(
    (clientX: number) => {
      const svg = svgRef.current;
      if (!svg) return PADDING_X;
      const rect = svg.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * SVG_WIDTH;
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      e.preventDefault();
      const svgX = getSVGX(e.clientX);
      const val = xToValue(svgX);
      onChange(val);
      setDragging(true);
      (e.target as Element).setPointerCapture(e.pointerId);
    },
    [disabled, getSVGX, xToValue, onChange]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const svgX = getSVGX(e.clientX);
      const val = xToValue(svgX);
      setHoverValue(val);
      if (dragging && !disabled) {
        onChange(val);
      }
    },
    [dragging, disabled, getSVGX, xToValue, onChange]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setHoverValue(null);
    setDragging(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = value !== null ? Math.min(max, parseFloat((value + snapTo).toFixed(2))) : min;
        onChange(next);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const next = value !== null ? Math.max(min, parseFloat((value - snapTo).toFixed(2))) : max;
        onChange(next);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onChange(NaN);
      }
    },
    [disabled, value, min, max, snapTo, onChange]
  );

  const handleClear = useCallback(() => {
    onChange(NaN);
  }, [onChange]);

  const ticks: { x: number; label: string; major: boolean }[] = [];
  for (let v = min; v <= max; v = parseFloat((v + step).toFixed(10))) {
    ticks.push({ x: valueToX(v), label: String(v), major: true });
    const halfV = parseFloat((v + step / 2).toFixed(10));
    if (halfV < max) {
      ticks.push({ x: valueToX(halfV), label: '', major: false });
    }
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-600">Отметьте точку на координатной прямой:</span>
        {value !== null && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded"
            aria-label="Удалить точку"
          >
            ✕ Очистить
          </button>
        )}
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full select-none cursor-crosshair"
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value ?? undefined}
        aria-label="Координатная прямая"
        tabIndex={disabled ? -1 : 0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onKeyDown={handleKeyDown}
        style={{ touchAction: 'none' }}
      >
        <line
          x1={PADDING_X - 10}
          y1={LINE_Y}
          x2={SVG_WIDTH - PADDING_X + 10}
          y2={LINE_Y}
          stroke="#475569"
          strokeWidth={2}
        />
        <polyline
          points={`${PADDING_X - 2},${LINE_Y - 6} ${PADDING_X - 10},${LINE_Y} ${PADDING_X - 2},${LINE_Y + 6}`}
          fill="none"
          stroke="#475569"
          strokeWidth={2}
        />
        <polyline
          points={`${SVG_WIDTH - PADDING_X + 2},${LINE_Y - 6} ${SVG_WIDTH - PADDING_X + 10},${LINE_Y} ${SVG_WIDTH - PADDING_X + 2},${LINE_Y + 6}`}
          fill="none"
          stroke="#475569"
          strokeWidth={2}
        />

        {ticks.map((tick, i) => (
          <g key={i}>
            <line
              x1={tick.x}
              y1={LINE_Y - (tick.major ? TICK_HALF : MINOR_TICK_HALF)}
              x2={tick.x}
              y2={LINE_Y + (tick.major ? TICK_HALF : MINOR_TICK_HALF)}
              stroke="#475569"
              strokeWidth={tick.major ? 2 : 1}
            />
            {tick.major && (
              <text
                x={tick.x}
                y={LINE_Y + TICK_HALF + 16}
                textAnchor="middle"
                fontSize={12}
                fill="#475569"
                fontFamily="system-ui"
              >
                {tick.label}
              </text>
            )}
          </g>
        ))}

        {markedPoints.map((pt, i) => {
          const px = valueToX(pt.value);
          const color = POINT_COLORS[i % POINT_COLORS.length]!;
          return (
            <g key={`mp-${pt.label}`}>
              <circle
                cx={px}
                cy={LINE_Y}
                r={6}
                fill={color}
                stroke="white"
                strokeWidth={1.5}
              />
              <text
                x={px}
                y={LINE_Y - 14}
                textAnchor="middle"
                fontSize={13}
                fontWeight="bold"
                fill={color}
                fontFamily="system-ui"
              >
                {pt.label}
              </text>
            </g>
          );
        })}

        {hoverValue !== null && !disabled && value !== hoverValue && (
          <>
            <line
              x1={valueToX(hoverValue)}
              y1={LINE_Y - 20}
              x2={valueToX(hoverValue)}
              y2={LINE_Y + 20}
              stroke="#3b82f6"
              strokeWidth={1.5}
              opacity={0.3}
            />
            <text
              x={valueToX(hoverValue)}
              y={LINE_Y - 24}
              textAnchor="middle"
              fontSize={11}
              fill="#3b82f6"
              opacity={0.5}
            >
              {hoverValue}
            </text>
          </>
        )}

        {value !== null && (
          <>
            <circle
              cx={valueToX(value)}
              cy={LINE_Y}
              r={8}
              fill="#3b82f6"
              stroke="white"
              strokeWidth={2}
              className="drop-shadow"
            />
            <text
              x={valueToX(value)}
              y={LINE_Y + TICK_HALF + 30}
              textAnchor="middle"
              fontSize={13}
              fontWeight="bold"
              fill="#1e40af"
            >
              {value}
            </text>
          </>
        )}
      </svg>
      {value !== null && (
        <p className="text-sm text-blue-600 mt-1 text-center">
          Выбрано значение: <strong>{value}</strong>
        </p>
      )}
    </div>
  );
}
