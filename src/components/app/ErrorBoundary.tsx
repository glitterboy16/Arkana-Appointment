import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Identificador de la rama que falló — usado para logs en consola. */
  contexto: string;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[Arkana boundary:${this.props.contexto}]`, error, info.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'var(--app-bg, #0A0A0A)',
          color: 'var(--app-text, #FAFAFA)',
          fontFamily: "'SF Pro Display','Inter',sans-serif",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
            Algo ha fallado
          </h1>
          <p style={{ fontSize: 14, opacity: 0.7, margin: '0 0 24px', lineHeight: 1.55 }}>
            Hemos registrado el error y nuestro equipo lo revisará. Puedes intentarlo de nuevo o
            volver al inicio.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                border: 'none',
                background: '#648DFF',
                color: '#FAFAFA',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={this.handleHome}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'transparent',
                color: 'inherit',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }
}
