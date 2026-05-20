import type { CSSProperties, ReactNode } from 'react';

export type MessageType = 'ok' | 'err' | 'info';

interface MessageBoxProps {
  type: MessageType;
  children: ReactNode;
  style?: CSSProperties;
}

const COLORS: Record<MessageType, { bg: string; border: string; text: string }> = {
  ok:   { bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.25)',  text: '#22C55E' },
  err:  { bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.25)',  text: '#EF4444' },
  info: { bg: 'rgba(100,141,255,0.10)', border: 'rgba(100,141,255,0.25)', text: '#648DFF' },
};

export default function MessageBox({ type, children, style }: MessageBoxProps) {
  const c = COLORS[type];
  return (
    <div
      role={type === 'err' ? 'alert' : 'status'}
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 13,
        lineHeight: 1.45,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
