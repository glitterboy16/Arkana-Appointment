import type { ReactNode } from 'react';

interface CardHomeProps {
  title: string;
  content: string;
  icon?: ReactNode;
}

export default function CardHome({ title, content, icon }: CardHomeProps) {
  return (
    <article className="glass-card p-6 transition-all duration-200">
      {icon && (
        <div
          className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ background: 'rgba(100,141,255,0.12)', color: '#648DFF' }}
        >
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-base font-bold" style={{ color: '#FAFAFA' }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: 'rgba(250,250,250,0.55)' }}>
        {content}
      </p>
    </article>
  );
}
