import { useState, type CSSProperties, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/app/Spinner';
import { Btn } from '@/components/app/Shared';
import MessageBox, { type MessageType } from '@/components/app/MessageBox';
import { contrasenaValida, emailValido, PASSWORD_REQUISITOS_MSG } from '@/lib/validators';

// Tarjeta compartida por ConfiguracionPage (cliente) y
// ConfiguracionNegocioPage (negocio) con las tres acciones de seguridad:
// estado de verificación del email, cambio de email y cambio de contraseña.

type Msg = { type: MessageType; text: string } | null;

export default function CuentaSeguridadCard() {
  const { session, emailVerificado, changeEmail, changePassword, resendVerification } = useAuth();
  const emailActual = session?.user?.email ?? '';

  return (
    <section style={cardStyle}>
      <h2 style={sectionTitleStyle}>Cuenta y seguridad</h2>
      <p style={helperStyle}>
        Email actual: <strong style={{ color: 'var(--app-text)' }}>{emailActual}</strong>
      </p>

      <VerificacionBlock
        verificado={emailVerificado}
        onResend={async () => {
          const { error } = await resendVerification();
          if (error) { toast.error(`No se pudo reenviar: ${error}`); return; }
          toast.success('Email de verificación reenviado');
        }}
      />

      <Divider />

      <CollapsibleAction
        title="Cambiar correo electrónico"
        description="Te enviaremos un enlace de confirmación a la dirección nueva."
        submitLabel="Enviar enlace"
        onSubmit={async ({ email }) => {
          if (!emailValido(email) || email.toLowerCase() === emailActual.toLowerCase()) {
            return { msg: { type: 'err', text: 'Introduce un email distinto al actual.' } };
          }
          const { error } = await changeEmail(email);
          if (error) return { msg: { type: 'err', text: error } };
          return {
            msg: {
              type: 'ok',
              text: 'Te hemos enviado un email a la nueva dirección para confirmar el cambio. Hasta que pulses el enlace, tu email actual seguirá activo.',
            },
            reset: true,
          };
        }}
      >
        {(state, setState) => (
          <input
            style={inputStyle}
            type="email"
            value={state.email ?? ''}
            onChange={(e) => setState({ email: e.target.value })}
            placeholder="nuevo@correo.com"
            autoComplete="email"
            required
          />
        )}
      </CollapsibleAction>

      <Divider />

      <CollapsibleAction
        title="Cambiar contraseña"
        description="Elige una nueva contraseña para tu cuenta."
        submitLabel="Guardar contraseña"
        onSubmit={async ({ pass, pass2 }) => {
          if (!contrasenaValida(pass ?? '')) {
            return { msg: { type: 'err', text: PASSWORD_REQUISITOS_MSG } };
          }
          if (pass !== pass2) {
            return { msg: { type: 'err', text: 'Las contraseñas no coinciden.' } };
          }
          const { error } = await changePassword(pass);
          if (error) return { msg: { type: 'err', text: error } };
          return {
            msg: { type: 'ok', text: 'Contraseña actualizada correctamente.' },
            reset: true,
          };
        }}
      >
        {(state, setState) => (
          <CambioPasswordInputs state={state} setState={setState} />
        )}
      </CollapsibleAction>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// Verificación de email
// ─────────────────────────────────────────────────────────────────

function VerificacionBlock({
  verificado,
  onResend,
}: {
  verificado: boolean;
  onResend: () => Promise<void>;
}) {
  const [sending, setSending] = useState(false);

  if (verificado) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
        borderRadius: 10, padding: '10px 14px', marginTop: 14,
      }}>
        <span style={{
          width: 22, height: 22, borderRadius: '50%', background: 'rgba(34,197,94,0.20)',
          color: '#22C55E', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, flexShrink: 0,
        }}>✓</span>
        <span style={{ fontSize: 13, color: 'var(--app-text)' }}>Email verificado</span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
      borderRadius: 10, padding: '12px 14px', marginTop: 14, flexWrap: 'wrap',
    }}>
      <div style={{ flex: '1 1 200px', minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text)' }}>
          Email sin verificar
        </div>
        <div style={{ fontSize: 12, color: 'var(--app-muted)', marginTop: 2 }}>
          Confirma tu cuenta para asegurar tu acceso si olvidas la contraseña.
        </div>
      </div>
      <Btn
        variant="ghost"
        size="sm"
        disabled={sending}
        onClick={async () => {
          setSending(true);
          try { await onResend(); } finally { setSending(false); }
        }}
      >
        {sending && <Spinner size={12} />}
        {sending ? 'Enviando…' : 'Reenviar email'}
      </Btn>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Acción colapsable genérica
//
// Encapsula el patrón {abrir → mostrar form → submit → mostrar mensaje
// → cerrar} que comparten cambio de email y cambio de contraseña.
// El cuerpo del form lo provee el caller vía children render-prop.
// ─────────────────────────────────────────────────────────────────

type ActionState = Record<string, string>;

interface CollapsibleActionResult {
  msg: NonNullable<Msg>;
  /** Si true y el msg es 'ok', limpia los campos del state. */
  reset?: boolean;
}

interface CollapsibleActionProps {
  title: string;
  description: string;
  submitLabel: string;
  onSubmit: (state: ActionState) => Promise<CollapsibleActionResult>;
  children: (state: ActionState, setState: (patch: ActionState) => void) => ReactNode;
}

function CollapsibleAction({
  title,
  description,
  submitLabel,
  onSubmit,
  children,
}: CollapsibleActionProps) {
  const [open, setOpen] = useState(false);
  const [state, setStateRaw] = useState<ActionState>({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  const setState = (patch: ActionState) => {
    setStateRaw(prev => ({ ...prev, ...patch }));
    setMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const result = await onSubmit(state);
    setLoading(false);
    setMsg(result.msg);
    if (result.reset && result.msg.type === 'ok') {
      setStateRaw({});
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setStateRaw({});
    setMsg(null);
  };

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: 12, flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--app-text)' }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--app-muted)', marginTop: 2 }}>{description}</div>
        </div>
        {!open && (
          <Btn variant="ghost" size="sm" onClick={() => { setOpen(true); setMsg(null); }}>
            Cambiar
          </Btn>
        )}
      </div>

      {open && (
        <form
          onSubmit={handleSubmit}
          noValidate
          style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          {msg && <MessageBox type={msg.type}>{msg.text}</MessageBox>}
          {children(state, setState)}
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn
              variant="ghost"
              size="md"
              onClick={handleCancel}
              disabled={loading}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              {msg?.type === 'ok' ? 'Cerrar' : 'Cancelar'}
            </Btn>
            {msg?.type !== 'ok' && (
              <Btn
                variant="primary"
                size="md"
                type="submit"
                disabled={loading}
                style={{ flex: 2, justifyContent: 'center' }}
              >
                {loading && <Spinner size={12} color="#FAFAFA" trackColor="rgba(250,250,250,0.35)" />}
                {loading ? 'Enviando…' : submitLabel}
              </Btn>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Inputs del cambio de contraseña (dos campos + toggle mostrar)
// ─────────────────────────────────────────────────────────────────

function CambioPasswordInputs({
  state,
  setState,
}: {
  state: ActionState;
  setState: (patch: ActionState) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <>
      <input
        style={inputStyle}
        type={show ? 'text' : 'password'}
        value={state.pass ?? ''}
        onChange={(e) => setState({ pass: e.target.value })}
        placeholder="Contraseña nueva"
        autoComplete="new-password"
        required
      />
      <input
        style={inputStyle}
        type={show ? 'text' : 'password'}
        value={state.pass2 ?? ''}
        onChange={(e) => setState({ pass2: e.target.value })}
        placeholder="Repite la contraseña"
        autoComplete="new-password"
        required
      />
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--app-muted)' }}>
        <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
        Mostrar contraseña
      </label>
    </>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--app-border)', margin: '18px 0' }} />;
}

// ─────────────────────────────────────────────────────────────────
// Estilos
// ─────────────────────────────────────────────────────────────────

const cardStyle: CSSProperties = {
  background: 'var(--app-surface)', border: '1px solid var(--app-border)',
  borderRadius: 14, padding: 24, marginBottom: 18,
};
const sectionTitleStyle: CSSProperties = {
  fontSize: 16, fontWeight: 700, color: 'var(--app-text)', margin: 0, letterSpacing: '-0.01em',
};
const helperStyle: CSSProperties = {
  fontSize: 13, color: 'var(--app-muted)', marginTop: 6, marginBottom: 0,
};
const inputStyle: CSSProperties = {
  width: '100%', boxSizing: 'border-box', background: 'var(--app-input-bg)',
  border: '1px solid var(--app-border)', borderRadius: 8, padding: '10px 14px',
  color: 'var(--app-text)', fontSize: 14, fontFamily: 'inherit', outline: 'none',
};
