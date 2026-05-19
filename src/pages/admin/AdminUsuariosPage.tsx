import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { BiSearch, BiTrash, BiEdit, BiPlus, BiBlock, BiCheck } from 'react-icons/bi';
import { supabase, type Usuario, type RolUsuario } from '@/lib/supabase';
import { InlineLoader, Spinner } from '@/components/app/Spinner';
import { Btn } from '@/components/app/Shared';
import ConfirmModal from '@/components/app/ConfirmModal';
import StyledSelect from '@/components/app/StyledSelect';
import { logError } from '@/lib/errorLogger';

type Filtro = 'todos' | 'cliente' | 'negocio' | 'admin';

interface EditState {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
}

interface CreateState {
  email: string;
  password: string;
  nombre: string;
  rol: RolUsuario;
  telefono: string;
  nombreNegocio: string; // solo si rol === 'negocio'
}

function generarSlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .concat('-', Math.random().toString(36).slice(2, 6));
}

const ROL_BADGE: Record<RolUsuario, { bg: string; color: string; label: string }> = {
  cliente: { bg: 'rgba(100,141,255,0.15)', color: '#648DFF', label: 'Cliente' },
  negocio: { bg: 'rgba(34,197,94,0.15)',   color: '#22C55E', label: 'Negocio' },
  admin:   { bg: 'rgba(239,68,68,0.15)',   color: '#EF4444', label: 'Admin' },
};

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [creating, setCreating] = useState<CreateState | null>(null);
  const [desactivarTarget, setDesactivarTarget] = useState<Usuario | null>(null);
  const [eliminarTarget, setEliminarTarget] = useState<Usuario | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      await logError('admin.usuarios.load', error);
      toast.error('No se pudieron cargar los usuarios');
      setUsuarios([]);
    } else {
      setUsuarios((data ?? []) as Usuario[]);
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    return usuarios.filter(u => {
      if (filtro !== 'todos' && u.rol !== filtro) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !u.nombre.toLowerCase().includes(q) &&
          !u.email.toLowerCase().includes(q) &&
          !(u.telefono ?? '').includes(q)
        ) return false;
      }
      return true;
    });
  }, [usuarios, filtro, search]);

  // ---------- EDITAR ----------
  const startEdit = (u: Usuario) => {
    setEditing({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      telefono: u.telefono ?? '',
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSavingId(editing.id);
    const { error } = await supabase
      .from('usuarios')
      .update({
        nombre: editing.nombre.trim(),
        email: editing.email.trim(),
        telefono: editing.telefono.trim() || null,
      })
      .eq('id', editing.id);
    setSavingId(null);

    if (error) {
      await logError('admin.usuarios.update', error, { usuario_id: editing.id });
      toast.error(`Error guardando: ${error.message}`);
      return;
    }

    setUsuarios(prev => prev.map(u =>
      u.id === editing.id ? { ...u, nombre: editing.nombre, email: editing.email, telefono: editing.telefono || null } : u,
    ));
    setEditing(null);
    toast.success('Usuario actualizado');
  };

  // ---------- DESACTIVAR / ACTIVAR (soft, reversible) ----------
  const confirmDesactivar = async () => {
    if (!desactivarTarget) return;
    const target = desactivarTarget;
    const desactivar = !target.eliminado; // si está activo lo desactivamos y al revés
    setSavingId(target.id);
    const { error } = await supabase
      .from('usuarios')
      .update({
        eliminado: desactivar,
        eliminado_at: desactivar ? new Date().toISOString() : null,
      })
      .eq('id', target.id);
    setSavingId(null);

    if (error) {
      await logError('admin.usuarios.toggle_activo', error, { usuario_id: target.id });
      toast.error(`Error: ${error.message}`);
      setDesactivarTarget(null);
      return;
    }

    setUsuarios(prev => prev.map(u =>
      u.id === target.id ? { ...u, eliminado: desactivar } : u,
    ));
    setDesactivarTarget(null);
    toast.success(desactivar ? 'Usuario desactivado' : 'Usuario reactivado');
  };

  // ---------- ELIMINAR (hard, irreversible — vía RPC SECURITY DEFINER) ----------
  const confirmEliminarTotal = async () => {
    if (!eliminarTarget) return;
    const target = eliminarTarget;
    setSavingId(target.id);
    const { error } = await supabase.rpc('admin_delete_usuario', { p_user_id: target.id });
    setSavingId(null);

    if (error) {
      await logError('admin.usuarios.hard_delete', error, { usuario_id: target.id });
      toast.error(`No se pudo eliminar: ${error.message}`);
      setEliminarTarget(null);
      return;
    }

    setUsuarios(prev => prev.filter(u => u.id !== target.id));
    setEliminarTarget(null);
    toast.success('Usuario eliminado por completo');
  };

  // ---------- CREAR ----------
  const startCreate = () => {
    setCreating({ email: '', password: '', nombre: '', rol: 'cliente', telefono: '', nombreNegocio: '' });
  };

  const submitCreate = async () => {
    if (!creating) return;
    if (!creating.email || !creating.password || !creating.nombre) {
      toast.error('Email, contraseña y nombre son obligatorios');
      return;
    }
    if (creating.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (creating.rol === 'negocio' && !creating.nombreNegocio.trim()) {
      toast.error('Introduce el nombre del negocio');
      return;
    }

    setSavingId('__creating');

    // Hacemos signUp con un cliente nuevo de Supabase para NO mover la sesión del admin actual.
    // El usuario creado queda autenticado en ese cliente paralelo, pero no afecta a la sesión del admin.
    const { createClient } = await import('@supabase/supabase-js');
    const tmp = createClient(
      import.meta.env.VITE_SUPABASE_URL as string,
      import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const { data, error } = await tmp.auth.signUp({
      email: creating.email,
      password: creating.password,
    });

    if (error || !data.user) {
      setSavingId(null);
      await logError('admin.usuarios.create.auth', error, { email: creating.email });
      toast.error(`No se pudo crear: ${error?.message ?? 'desconocido'}`);
      return;
    }

    // Crear/actualizar la fila en public.usuarios con el rol que escogió el admin
    const { error: errProfile } = await supabase.from('usuarios').upsert({
      id: data.user.id,
      email: creating.email,
      nombre: creating.nombre.trim(),
      rol: creating.rol,
      telefono: creating.telefono.trim() || null,
      eliminado: false,
    });

    if (errProfile) {
      setSavingId(null);
      await logError('admin.usuarios.create.profile', errProfile, { usuario_id: data.user.id });
      toast.error(`Usuario creado en auth pero falló el perfil: ${errProfile.message}`);
      return;
    }

    // Si el rol es 'negocio', creamos también la fila en `negocios` con su slug.
    // Sin esto, el usuario podría loguearse pero su panel quedaría capado (sin perfil).
    if (creating.rol === 'negocio') {
      const slug = generarSlug(creating.nombreNegocio);
      const { error: errNeg } = await supabase.from('negocios').insert({
        usuario_id: data.user.id,
        nombre: creating.nombreNegocio.trim(),
        slug,
      });

      if (errNeg) {
        setSavingId(null);
        await logError('admin.usuarios.create.negocio', errNeg, { usuario_id: data.user.id });
        toast.error(`Usuario creado pero falló el negocio: ${errNeg.message}`);
        return;
      }
    }

    setSavingId(null);
    setCreating(null);
    toast.success(`Usuario ${creating.email} creado`);
    void load();
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: 'var(--app-bg)' }}>
      <div style={{
        padding: '18px clamp(14px, 4vw, 28px)', borderBottom: '1px solid var(--app-border)',
        background: 'var(--app-bg-elevated)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--app-subtle)', marginBottom: 3 }}>
            Admin &rsaquo; <span style={{ color: 'var(--app-muted)' }}>Usuarios</span>
          </div>
          <div style={{
            fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 700, color: 'var(--app-text)',
            letterSpacing: '-0.01em', fontFamily: "'SF Pro Display','Inter',sans-serif",
          }}>
            Gestión de usuarios
          </div>
        </div>
        <Btn variant="primary" size="sm" onClick={startCreate}>
          <BiPlus size={16} /> Crear usuario
        </Btn>
      </div>

      <div className="ark-page-fade" style={{ padding: '20px clamp(14px, 4vw, 28px)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Filtros */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {(['todos', 'cliente', 'negocio', 'admin'] as Filtro[]).map(f => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                style={{
                  padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                  background: filtro === f ? 'rgba(100,141,255,0.15)' : 'transparent',
                  color: filtro === f ? '#648DFF' : 'var(--app-muted)',
                  textTransform: 'capitalize',
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <BiSearch size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--app-subtle)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, email, teléfono…"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--app-input-bg)', border: '1px solid var(--app-border)',
                borderRadius: 8, padding: '9px 14px 9px 36px',
                color: 'var(--app-text)', fontSize: 13, fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Tabla */}
        <div style={{
          background: 'var(--app-surface)', border: '1px solid var(--app-border)',
          borderRadius: 12, overflow: 'hidden',
        }}>
          {loading ? (
            <InlineLoader label="Cargando usuarios…" minHeight={220} />
          ) : filtered.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--app-subtle)', fontSize: 13 }}>
              No hay usuarios que coincidan con los filtros.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--app-border)', background: 'var(--app-bg-elevated)' }}>
                    <th style={th}>Nombre</th>
                    <th style={th}>Email</th>
                    <th style={th}>Teléfono</th>
                    <th style={th}>Rol</th>
                    <th style={th}>Alta</th>
                    <th style={th}>Estado</th>
                    <th style={{ ...th, textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => {
                    const badge = ROL_BADGE[u.rol];
                    const saving = savingId === u.id;
                    return (
                      <tr key={u.id} style={{
                        borderBottom: '1px solid var(--app-border)',
                        opacity: u.eliminado ? 0.55 : 1,
                      }}>
                        <td style={td}>{u.nombre}</td>
                        <td style={{ ...td, color: 'var(--app-muted)', fontFamily: 'monospace', fontSize: 12 }}>{u.email}</td>
                        <td style={{ ...td, color: 'var(--app-muted)' }}>{u.telefono ?? '—'}</td>
                        <td style={td}>
                          <span style={{
                            padding: '3px 9px', borderRadius: 6,
                            background: badge.bg, color: badge.color,
                            fontSize: 11, fontWeight: 600,
                          }}>
                            {badge.label}
                          </span>
                        </td>
                        <td style={{ ...td, color: 'var(--app-subtle)', fontSize: 12 }}>
                          {format(parseISO(u.created_at), "d MMM yyyy", { locale: es })}
                        </td>
                        <td style={td}>
                          {u.eliminado ? (
                            <span style={{
                              padding: '3px 9px', borderRadius: 6,
                              background: 'rgba(245,158,11,0.15)', color: '#F59E0B',
                              fontSize: 11, fontWeight: 600,
                            }}>
                              Desactivado
                            </span>
                          ) : (
                            <span style={{
                              padding: '3px 9px', borderRadius: 6,
                              background: 'rgba(34,197,94,0.15)', color: '#22C55E',
                              fontSize: 11, fontWeight: 600,
                            }}>
                              Activo
                            </span>
                          )}
                        </td>
                        <td style={{ ...td, textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            {saving && <Spinner size={14} />}
                            <button onClick={() => startEdit(u)} disabled={saving} style={actionBtn('#648DFF')} title="Editar">
                              <BiEdit size={14} />
                            </button>
                            <button
                              onClick={() => setDesactivarTarget(u)}
                              disabled={saving || u.rol === 'admin'}
                              style={actionBtn(u.eliminado ? '#22C55E' : '#F59E0B')}
                              title={u.rol === 'admin' ? 'No se puede desactivar un admin' : (u.eliminado ? 'Activar' : 'Desactivar')}
                            >
                              {u.eliminado ? <BiCheck size={14} /> : <BiBlock size={14} />}
                            </button>
                            <button
                              onClick={() => setEliminarTarget(u)}
                              disabled={saving || u.rol === 'admin'}
                              style={actionBtn('#EF4444')}
                              title={u.rol === 'admin' ? 'No se puede eliminar un admin' : 'Eliminar por completo'}
                            >
                              <BiTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Editar */}
      {editing && (
        <Modal onClose={() => setEditing(null)} title="Editar usuario">
          <Field label="Nombre">
            <input style={input} value={editing.nombre} onChange={(e) => setEditing({ ...editing, nombre: e.target.value })} />
          </Field>
          <Field label="Email">
            <input style={input} type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
          </Field>
          <Field label="Teléfono">
            <input style={input} value={editing.telefono} onChange={(e) => setEditing({ ...editing, telefono: e.target.value })} placeholder="—" />
          </Field>
          <div style={modalActions}>
            <Btn variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancelar</Btn>
            <Btn variant="primary" size="sm" onClick={saveEdit} disabled={savingId === editing.id}>
              {savingId === editing.id ? 'Guardando…' : 'Guardar'}
            </Btn>
          </div>
        </Modal>
      )}

      {/* Modal Crear */}
      {creating && (
        <Modal onClose={() => setCreating(null)} title="Crear nuevo usuario">
          <Field label="Email">
            <input style={input} type="email" value={creating.email} onChange={(e) => setCreating({ ...creating, email: e.target.value })} placeholder="correo@ejemplo.com" />
          </Field>
          <Field label="Contraseña (min. 6)">
            <input style={input} type="text" value={creating.password} onChange={(e) => setCreating({ ...creating, password: e.target.value })} placeholder="••••••••" />
          </Field>
          <Field label="Nombre">
            <input style={input} value={creating.nombre} onChange={(e) => setCreating({ ...creating, nombre: e.target.value })} />
          </Field>
          <Field label="Rol">
            <StyledSelect
              value={creating.rol}
              onChange={(v) => setCreating({ ...creating, rol: v as RolUsuario })}
              options={[
                { value: 'cliente', label: 'Cliente' },
                { value: 'negocio', label: 'Negocio' },
                { value: 'admin', label: 'Admin' },
              ]}
              ariaLabel="Rol"
            />
          </Field>
          {creating.rol === 'negocio' && (
            <Field label="Nombre del negocio">
              <input style={input} value={creating.nombreNegocio} onChange={(e) => setCreating({ ...creating, nombreNegocio: e.target.value })} placeholder="Ej. Clínica Dental Sonrisa" />
            </Field>
          )}
          <Field label="Teléfono (opcional)">
            <input style={input} value={creating.telefono} onChange={(e) => setCreating({ ...creating, telefono: e.target.value })} placeholder="612345678" />
          </Field>
          <div style={modalActions}>
            <Btn variant="ghost" size="sm" onClick={() => setCreating(null)}>Cancelar</Btn>
            <Btn variant="primary" size="sm" onClick={submitCreate} disabled={savingId === '__creating'}>
              {savingId === '__creating' ? 'Creando…' : 'Crear usuario'}
            </Btn>
          </div>
        </Modal>
      )}

      <ConfirmModal
        open={!!desactivarTarget}
        title={desactivarTarget?.eliminado ? '¿Reactivar usuario?' : '¿Desactivar usuario?'}
        message={desactivarTarget ? (
          desactivarTarget.eliminado ? (
            <>
              Vas a reactivar a <strong>{desactivarTarget.nombre}</strong> ({desactivarTarget.email}).
              Podrá volver a iniciar sesión y usar la plataforma con normalidad.
            </>
          ) : (
            <>
              Vas a desactivar a <strong>{desactivarTarget.nombre}</strong> ({desactivarTarget.email}).
              <br />No podrá iniciar sesión, pero sus datos se conservan y podrás reactivarlo cuando quieras.
            </>
          )
        ) : null}
        confirmLabel={desactivarTarget?.eliminado ? 'Sí, reactivar' : 'Sí, desactivar'}
        cancelLabel="Cancelar"
        variant={desactivarTarget?.eliminado ? 'primary' : 'danger'}
        loading={savingId === desactivarTarget?.id}
        onConfirm={confirmDesactivar}
        onCancel={() => { if (!savingId) setDesactivarTarget(null); }}
      />

      <ConfirmModal
        open={!!eliminarTarget}
        title="¿Eliminar por completo?"
        message={eliminarTarget ? (
          <>
            Esta acción <strong>no se puede deshacer</strong>. Vas a borrar a{' '}
            <strong>{eliminarTarget.nombre}</strong> ({eliminarTarget.email}) de la base de datos.
            {eliminarTarget.rol === 'negocio' && (
              <> También se borrará su negocio, servicios, horarios y citas asociadas.</>
            )}
            <br /><br />
            Si solo quieres bloquearle el acceso temporalmente, usa <strong>Desactivar</strong> en
            su lugar.
          </>
        ) : null}
        confirmLabel="Sí, eliminar para siempre"
        cancelLabel="Cancelar"
        variant="danger"
        loading={savingId === eliminarTarget?.id}
        onConfirm={confirmEliminarTotal}
        onCancel={() => { if (!savingId) setEliminarTarget(null); }}
      />
    </div>
  );
}

// ---------- styles helpers ----------
const th: React.CSSProperties = {
  padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700,
  color: 'var(--app-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em',
};
const td: React.CSSProperties = {
  padding: '11px 14px', color: 'var(--app-text)', verticalAlign: 'middle',
};
const input: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'var(--app-input-bg)', border: '1px solid var(--app-border)',
  borderRadius: 8, padding: '10px 14px',
  color: 'var(--app-text)', fontSize: 13, fontFamily: 'inherit', outline: 'none',
};
const modalActions: React.CSSProperties = {
  display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--app-border)',
};

function actionBtn(color: string): React.CSSProperties {
  const rgb = color === '#22C55E' ? '34,197,94' : color === '#EF4444' ? '239,68,68' : '100,141,255';
  return {
    padding: '6px 10px', borderRadius: 6,
    border: `1px solid rgba(${rgb},0.4)`,
    background: `rgba(${rgb},0.10)`,
    color, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 4,
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11, color: 'var(--app-muted)', display: 'block', marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Modal({ children, title, onClose }: { children: React.ReactNode; title: string; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 460,
          background: 'var(--app-bg-elevated)', border: '1px solid var(--app-border)',
          borderRadius: 14, padding: '20px 22px',
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--app-text)' }}>
          {title}
        </div>
        {children}
      </div>
    </div>
  );
}
