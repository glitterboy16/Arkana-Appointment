import { useState, type CSSProperties, type ReactNode } from 'react';
import QRCode from 'react-qr-code';
import { ArkanaIcons, Btn } from '@/components/app/Shared';

function ProfileSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        fontSize: 13, fontWeight: 700, color: 'rgba(250,250,250,0.70)', letterSpacing: '0.03em' }}>
        {title}
      </div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  );
}

interface ScheduleRowProps {
  day: string;
  enabled: boolean;
}

function ScheduleRow({ day, enabled }: ScheduleRowProps) {
  const [on, setOn] = useState(enabled);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ width: 80, fontSize: 13, color: on ? '#FAFAFA' : 'rgba(250,250,250,0.35)' }}>{day}</div>
      <div onClick={() => setOn(!on)} style={{ width: 36, height: 20, borderRadius: 10, cursor: 'pointer', transition: 'all 200ms ease',
        background: on ? '#648DFF' : 'rgba(255,255,255,0.15)', position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute',
          top: 2, left: on ? 18 : 2, transition: 'left 200ms ease' }} />
      </div>
      {on ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select defaultValue="09:00" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 6, padding: '5px 8px', color: '#FAFAFA', fontSize: 12, fontFamily: 'inherit', outline: 'none' }}>
            {['08:00', '09:00', '10:00'].map((t) => <option key={t}>{t}</option>)}
          </select>
          <span style={{ color: 'rgba(250,250,250,0.30)', fontSize: 12 }}>→</span>
          <select defaultValue="18:00" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 6, padding: '5px 8px', color: '#FAFAFA', fontSize: 12, fontFamily: 'inherit', outline: 'none' }}>
            {['17:00', '18:00', '19:00', '20:00'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      ) : (
        <span style={{ fontSize: 12, color: 'rgba(250,250,250,0.25)' }}>Cerrado</span>
      )}
    </div>
  );
}

function ServiceTag({ name, duration, price }: { name: string; duration: string; price: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 9, marginBottom: 8 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#FAFAFA' }}>{name}</div>
        <div style={{ fontSize: 11, color: 'rgba(250,250,250,0.40)', marginTop: 1 }}>{duration}</div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#648DFF' }}>{price}</div>
      <button type="button" style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)',
        background: 'transparent', color: 'rgba(250,250,250,0.45)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
        Editar
      </button>
    </div>
  );
}

function QRBlock() {
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/n/sonrisa`;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
      <div style={{ width: 96, height: 96, background: '#FAFAFA', borderRadius: 12, padding: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <QRCode value={url} size={80} bgColor="#FAFAFA" fgColor="#050A30" />
      </div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#FAFAFA', marginBottom: 6 }}>Tu QR único</div>
        <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.50)', lineHeight: 1.5, marginBottom: 12 }}>
          Comparte este código para que tus clientes reserven directamente sin registrarse.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="primary" size="sm">Descargar PNG</Btn>
          <Btn variant="ghost" size="sm">Copiar enlace</Btn>
        </div>
      </div>
    </div>
  );
}

const SCHEDULE = [
  { day: 'Lunes', enabled: true },
  { day: 'Martes', enabled: true },
  { day: 'Miércoles', enabled: true },
  { day: 'Jueves', enabled: true },
  { day: 'Viernes', enabled: true },
  { day: 'Sábado', enabled: false },
  { day: 'Domingo', enabled: false },
];

export default function PerfilNegocioPage() {
  const inputStyle: CSSProperties = { width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '10px 14px',
    color: '#FAFAFA', fontSize: 13, fontFamily: 'inherit', outline: 'none' };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: '#080C3E' }}>
      <div style={{ padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: '#050A30', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#FAFAFA',
          fontFamily: "'SF Pro Display','Inter',sans-serif" }}>Perfil del negocio</div>
        <Btn variant="primary" size="sm">Guardar cambios</Btn>
      </div>

      <div style={{ padding: '20px 28px', maxWidth: 720 }}>
        <ProfileSection title="Información general">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: 11, color: 'rgba(250,250,250,0.45)', display: 'block', marginBottom: 4 }}>Nombre del negocio</label>
                <input style={inputStyle} defaultValue="Clínica Dental Sonrisa" />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: 11, color: 'rgba(250,250,250,0.45)', display: 'block', marginBottom: 4 }}>Categoría</label>
                <select style={{ ...inputStyle, appearance: 'none' }}>
                  <option>Clínica dental</option>
                  <option>Salón de belleza</option>
                  <option>Spa / Bienestar</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'rgba(250,250,250,0.45)', display: 'block', marginBottom: 4 }}>Descripción</label>
              <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 72, lineHeight: 1.5 }}
                defaultValue="Clínica dental de confianza en el corazón de Madrid. Más de 15 años de experiencia." />
            </div>
          </div>
        </ProfileSection>

        <ProfileSection title="Horario de atención">
          {SCHEDULE.map((d) => <ScheduleRow key={d.day} day={d.day} enabled={d.enabled} />)}
        </ProfileSection>

        <ProfileSection title="Servicios">
          <ServiceTag name="Limpieza dental" duration="45 min" price="40€" />
          <ServiceTag name="Blanqueamiento" duration="90 min" price="120€" />
          <ServiceTag name="Revisión completa" duration="30 min" price="25€" />
          <Btn variant="ghost" size="sm" style={{ marginTop: 6 }}>
            {ArkanaIcons.plus} Añadir servicio
          </Btn>
        </ProfileSection>

        <ProfileSection title="Código QR">
          <QRBlock />
        </ProfileSection>
      </div>
    </div>
  );
}
