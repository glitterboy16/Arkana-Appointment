import { useMemo, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import toast from 'react-hot-toast';
import { BiCopy, BiDownload, BiPrinter, BiLinkExternal, BiQr } from 'react-icons/bi';
import { useAuth } from '@/contexts/AuthContext';
import { Btn } from '@/components/app/Shared';
import arkanaIcon from '@/assets/Logo Arkana 1.svg';

const QR_PRINT_SIZE = 360;

export default function QrPage() {
  const { negocio } = useAuth();
  const qrRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const qrUrl = useMemo(() => {
    if (!negocio?.slug) return '';
    return `${window.location.origin}/n/${negocio.slug}`;
  }, [negocio?.slug]);

  const handleCopy = () => {
    if (!qrUrl) return;
    navigator.clipboard.writeText(qrUrl)
      .then(() => toast.success('Enlace copiado'))
      .catch(() => toast.error('No se pudo copiar'));
  };

  const handleOpenPublic = () => {
    if (!qrUrl) return;
    window.open(qrUrl, '_blank', 'noopener,noreferrer');
  };

  /**
   * Convierte el SVG del QR en PNG y dispara la descarga. Funciona offline,
   * sin librerías externas: serializamos el SVG → blob → image → canvas → blob PNG.
   */
  const handleDownloadPng = async () => {
    if (!qrRef.current || !negocio) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) {
      toast.error('No se encontró el QR para descargar');
      return;
    }

    setDownloading(true);
    try {
      // Clonamos el SVG y aseguramos los atributos namespacing/size para que la imagen los entienda
      const cloned = svg.cloneNode(true) as SVGSVGElement;
      const size = QR_PRINT_SIZE * 2; // 2x para alta resolución
      cloned.setAttribute('width', String(size));
      cloned.setAttribute('height', String(size));
      cloned.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

      const xml = new XMLSerializer().serializeToString(cloned);
      const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) { URL.revokeObjectURL(url); reject(new Error('No 2D context')); return; }
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(img, 0, 0, size, size);
          URL.revokeObjectURL(url);

          // Logo de Arkana al centro: fondo blanco redondeado + imagen.
          const logoBox = Math.round(size * 0.22);
          const logoX = (size - logoBox) / 2;
          const logoY = (size - logoBox) / 2;
          // Fondo blanco con esquinas redondeadas
          const radius = 24;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.moveTo(logoX + radius, logoY);
          ctx.lineTo(logoX + logoBox - radius, logoY);
          ctx.quadraticCurveTo(logoX + logoBox, logoY, logoX + logoBox, logoY + radius);
          ctx.lineTo(logoX + logoBox, logoY + logoBox - radius);
          ctx.quadraticCurveTo(logoX + logoBox, logoY + logoBox, logoX + logoBox - radius, logoY + logoBox);
          ctx.lineTo(logoX + radius, logoY + logoBox);
          ctx.quadraticCurveTo(logoX, logoY + logoBox, logoX, logoY + logoBox - radius);
          ctx.lineTo(logoX, logoY + radius);
          ctx.quadraticCurveTo(logoX, logoY, logoX + radius, logoY);
          ctx.closePath();
          ctx.fill();

          const finishCanvas = () => {
            canvas.toBlob((b) => {
              if (!b) { reject(new Error('Empty PNG blob')); return; }
              const a = document.createElement('a');
              const dlUrl = URL.createObjectURL(b);
              a.href = dlUrl;
              a.download = `arkana-qr-${negocio.slug}.png`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(dlUrl);
              resolve();
            }, 'image/png');
          };

          const logoImg = new Image();
          logoImg.onload = () => {
            // Padding interno para que el SVG no toque los bordes del fondo
            const pad = Math.round(logoBox * 0.12);
            ctx.drawImage(logoImg, logoX + pad, logoY + pad, logoBox - 2 * pad, logoBox - 2 * pad);
            finishCanvas();
          };
          logoImg.onerror = () => { finishCanvas(); }; // si el logo falla, mejor el QR sin él
          logoImg.src = arkanaIcon;
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG → image failed')); };
        img.src = url;
      });

      toast.success('QR descargado');
    } catch {
      toast.error('No se pudo descargar el QR');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrintPdf = () => {
    if (!qrUrl) return;
    // El CSS @media print en index.css oculta todo lo que NO sea .ark-qr-printable.
    window.print();
  };

  if (!negocio) {
    return (
      <div style={{ padding: 40, color: 'var(--app-muted)' }}>
        Cargando datos del negocio…
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--app-bg)' }}>

      <div className="ark-qr-hide-on-print" style={{
        padding: '18px clamp(14px, 4vw, 28px)', borderBottom: '1px solid var(--app-border)',
        background: 'var(--app-bg-elevated)', flexShrink: 0,
      }}>
        <div style={{ fontSize: 11, color: 'var(--app-subtle)', marginBottom: 3 }}>
          Arkana &rsaquo; <span style={{ color: 'var(--app-muted)' }}>Código QR</span>
        </div>
        <div style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 700, color: 'var(--app-text)', letterSpacing: '-0.01em', fontFamily: "'SF Pro Display','Inter',sans-serif" }}>
          Tu código QR
        </div>
      </div>

      <div className="ark-page-fade" style={{
        padding: 'clamp(16px, 3.5vw, 24px) clamp(14px, 4vw, 28px)',
        display: 'flex', flexDirection: 'column', gap: 20, flex: 1,
      }}>

        {/* Tarjeta imprimible — esta es la única zona que sobrevive al @media print */}
        <div className="ark-qr-printable" style={{
          background: 'var(--app-surface)', border: '1px solid var(--app-border)',
          borderRadius: 16, padding: 'clamp(20px, 4vw, 36px)',
          display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap',
          maxWidth: 760,
        }}>
          {/* Marco del QR con logo de Arkana al centro.
              Nivel "H" → 30% de corrección de errores, suficiente para tapar
              hasta ~25% del QR con el logo sin romper la lectura. */}
          <div ref={qrRef} className="ark-qr-frame" style={{
            background: '#FFFFFF',
            padding: 'clamp(12px, 3vw, 18px)',
            borderRadius: 14,
            boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
            display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            position: 'relative',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}>
            <QRCode
              value={qrUrl}
              size={QR_PRINT_SIZE}
              bgColor="#FFFFFF"
              fgColor="#050A30"
              level="H"
            />
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '22%',
              height: '22%',
              background: '#FFFFFF',
              borderRadius: 12,
              padding: '6%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 4px #FFFFFF',
              pointerEvents: 'none',
              boxSizing: 'border-box',
            }}>
              <img
                src={arkanaIcon}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                draggable={false}
              />
            </div>
          </div>

          {/* Texto al lado del QR — se ve también al imprimir */}
          <div style={{ flex: '1 1 240px', minWidth: 0 }}>
            <div className="ark-qr-print-brand" style={{
              fontSize: 12, fontWeight: 700, letterSpacing: '0.20em',
              color: '#648DFF', textTransform: 'uppercase',
            }}>
              Arkana Appointments
            </div>
            <div style={{
              fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700,
              color: 'var(--app-text)', marginTop: 6, letterSpacing: '-0.01em',
              fontFamily: "'SF Pro Display','Inter',sans-serif",
              lineHeight: 1.15,
            }}>
              {negocio.nombre}
            </div>
            {negocio.categoria && (
              <div style={{ fontSize: 13, color: 'var(--app-muted)', marginTop: 6 }}>
                {negocio.categoria}
              </div>
            )}
            <div style={{
              marginTop: 18, padding: '12px 14px', borderRadius: 10,
              background: 'rgba(100,141,255,0.10)',
              border: '1px solid rgba(100,141,255,0.25)',
              fontSize: 13, color: 'var(--app-text)', lineHeight: 1.45,
            }}>
              Escanea este código con tu móvil para <strong>reservar tu cita</strong> al instante. No necesitas crear cuenta.
            </div>
            <div style={{
              marginTop: 12, fontSize: 11, color: 'var(--app-subtle)',
              wordBreak: 'break-all',
            }}>
              {qrUrl}
            </div>
          </div>
        </div>

        {/* Acciones — ocultas al imprimir */}
        <div className="ark-qr-hide-on-print" style={{
          background: 'var(--app-surface)', border: '1px solid var(--app-border)',
          borderRadius: 12, padding: 'clamp(16px, 3vw, 22px)',
          maxWidth: 760,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--app-text)', marginBottom: 4 }}>
            Compartir y exportar
          </div>
          <div style={{ fontSize: 12, color: 'var(--app-subtle)', marginBottom: 16 }}>
            Pega este QR en tu local, en tu escaparate o en redes. Cada negocio tiene su propio QR único y permanente.
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Btn variant="primary" size="md" onClick={handleDownloadPng} disabled={downloading}>
              <BiDownload size={16} />
              {downloading ? 'Generando…' : 'Descargar PNG'}
            </Btn>
            <Btn variant="accent" size="md" onClick={handlePrintPdf}>
              <BiPrinter size={16} />
              Exportar PDF
            </Btn>
            <Btn variant="ghost" size="md" onClick={handleCopy}>
              <BiCopy size={16} />
              Copiar enlace
            </Btn>
            <Btn variant="ghost" size="md" onClick={handleOpenPublic}>
              <BiLinkExternal size={16} />
              Probar enlace
            </Btn>
          </div>

          <div style={{ marginTop: 18, padding: '12px 14px', borderRadius: 9, background: 'var(--app-input-bg)', border: '1px dashed var(--app-border)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <BiQr size={20} style={{ color: '#648DFF', flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 12, color: 'var(--app-muted)', lineHeight: 1.55 }}>
                Para exportarlo en PDF tu navegador abrirá el diálogo de impresión.
                Elige <strong>"Guardar como PDF"</strong> como destino. El tamaño y los detalles del negocio ya están preparados para imprimir.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

