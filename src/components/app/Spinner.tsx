import type { CSSProperties } from 'react';

interface SpinnerProps {
  size?: number;
  color?: string;
  trackColor?: string;
  thickness?: number;
  style?: CSSProperties;
}

export function Spinner({
  size = 18,
  color = '#648DFF',
  trackColor,
  thickness,
  style,
}: SpinnerProps) {
  const border = thickness ?? Math.max(2, Math.round(size / 9));
  return (
    <span
      className="ark-spinner"
      style={{
        width: size,
        height: size,
        borderWidth: border,
        borderColor: trackColor ?? `${color}33`,
        borderTopColor: color,
        ...style,
      }}
      role="status"
      aria-label="Cargando"
    />
  );
}

interface FullScreenLoaderProps {
  label?: string;
}

export function FullScreenLoader({ label = 'Cargando…' }: FullScreenLoaderProps) {
  return (
    <div className="ark-fullscreen-loader">
      <Spinner size={36} />
      <div style={{ fontSize: 13, animation: 'ark-pulse 1.6s ease-in-out infinite' }}>{label}</div>
    </div>
  );
}

interface InlineLoaderProps {
  label?: string;
  minHeight?: number | string;
}

export function InlineLoader({ label = 'Cargando…', minHeight }: InlineLoaderProps) {
  return (
    <div className="ark-inline-loader" style={minHeight ? { minHeight } : undefined}>
      <Spinner size={26} />
      <div style={{ animation: 'ark-pulse 1.6s ease-in-out infinite' }}>{label}</div>
    </div>
  );
}

interface SkeletonProps {
  height?: number | string;
  width?: number | string;
  radius?: number | string;
  style?: CSSProperties;
}

export function Skeleton({ height = 14, width = '100%', radius = 8, style }: SkeletonProps) {
  return (
    <div
      className="ark-skeleton"
      style={{
        height,
        width,
        borderRadius: radius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
