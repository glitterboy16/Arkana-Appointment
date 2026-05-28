// Edge Function: send-whatsapp
//
// Disparada por un Database Webhook de Supabase sobre la tabla `citas`
// (eventos INSERT y UPDATE). Decide qué notificación mandar según el
// cambio de estado y llama a Evolution API para enviar el WhatsApp.
//
// Variables de entorno (configurar como secrets en Supabase):
//   EVOLUTION_BASE_URL        ej. https://evolution-api-production-bbc5.up.railway.app
//   EVOLUTION_API_KEY         la AUTHENTICATION_API_KEY global
//   EVOLUTION_INSTANCE_NAME   por defecto "arkana"
//
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY se inyectan automaticamente.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

type EstadoCita = 'new' | 'pending' | 'confirmed' | 'cancelled' | 'completed';

interface CitaRecord {
  id: string;
  negocio_id: string;
  servicio_id: string;
  cliente_id: string | null;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email: string | null;
  fecha: string;
  hora_inicio: string;
  estado: EstadoCita;
  fecha_anterior: string | null;
  hora_inicio_anterior: string | null;
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: CitaRecord | null;
  old_record: CitaRecord | null;
}

type EventoNotif = 'new' | 'confirmed' | 'cancelled' | 'rescheduled';

// ─────────────────────────────────────────────────────────────────
// Plantillas de mensaje (las que Angel pidio en el plan original)
// ─────────────────────────────────────────────────────────────────
function tplNuevaCitaNegocio(d: {
  clientName: string;
  service: string;
  date: string;
  time: string;
}): string {
  return [
    '🗓️ *Nueva cita en Arkana*',
    '',
    `Cliente: ${d.clientName}`,
    `Servicio: ${d.service}`,
    `Fecha: ${d.date}`,
    `Hora: ${d.time}`,
    '',
    'Accede a tu panel para gestionarla.',
    '',
    '_Este número no recibe respuestas._',
  ].join('\n');
}

function tplConfirmadaCliente(d: {
  clientName: string;
  businessName: string;
  service: string;
  date: string;
  time: string;
}): string {
  return [
    '✅ *Tu cita ha sido confirmada*',
    '',
    `Hola ${d.clientName}, tu cita en *${d.businessName}* para ${d.service} el ${d.date} a las ${d.time} está confirmada.`,
    '',
    '¡Te esperamos!',
    '',
    `_Para dudas, contacta directamente con ${d.businessName}._`,
  ].join('\n');
}

function tplCanceladaCliente(d: {
  clientName: string;
  businessName: string;
  date: string;
  time: string;
}): string {
  return [
    '❌ *Cita cancelada*',
    '',
    `Hola ${d.clientName}, tu cita en *${d.businessName}* prevista para el ${d.date} a las ${d.time} ha sido cancelada.`,
    '',
    `_Para dudas, contacta directamente con ${d.businessName}._`,
  ].join('\n');
}

function tplReagendadaCliente(d: {
  clientName: string;
  businessName: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
}): string {
  return [
    '🔄 *Cita reagendada*',
    '',
    `Hola ${d.clientName}, tu cita en *${d.businessName}* ha sido reagendada.`,
    '',
    `📅 Antes: ${d.oldDate} a las ${d.oldTime}`,
    `📆 Ahora: *${d.newDate} a las ${d.newTime}*`,
    '',
    '¡Te esperamos en la nueva fecha!',
    '',
    `_Para dudas, contacta directamente con ${d.businessName}._`,
  ].join('\n');
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
function formatFecha(iso: string): string {
  // 2026-05-19 → 19/05/2026
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function formatHora(time: string): string {
  // 14:30:00 → 14:30
  return time.slice(0, 5);
}

function normalizarTelefono(raw: string | null | undefined): string | null {
  if (!raw) return null;
  // Quitar todo lo que no sea dígito
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 0) return null;
  // Si tiene 9 dígitos asumimos España y prepongo 34
  if (digits.length === 9) return `34${digits}`;
  return digits;
}

function detectarEvento(payload: WebhookPayload): EventoNotif | null {
  const { type, record, old_record } = payload;
  if (!record) return null;

  if (type === 'INSERT') {
    // Cualquier inserción nueva genera notificación al negocio
    return 'new';
  }

  if (type === 'UPDATE' && old_record) {
    // Cambio de estado
    if (old_record.estado !== record.estado) {
      if (record.estado === 'confirmed') return 'confirmed';
      if (record.estado === 'cancelled') return 'cancelled';
    }
    // Cambio de fecha o hora (reagendado)
    const fechaCambio = old_record.fecha !== record.fecha;
    const horaCambio = old_record.hora_inicio !== record.hora_inicio;
    if (fechaCambio || horaCambio) return 'rescheduled';
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────
// Cliente Evolution API
// ─────────────────────────────────────────────────────────────────
async function sendWhatsApp(args: {
  baseUrl: string;
  apiKey: string;
  instance: string;
  number: string;
  text: string;
}): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const url = `${args.baseUrl.replace(/\/$/, '')}/message/sendText/${args.instance}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: args.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ number: args.number, text: args.text }),
    });
    const json = (await res.json()) as { key?: { id?: string }; message?: unknown };
    if (!res.ok) {
      return { ok: false, error: `Evolution ${res.status}: ${JSON.stringify(json).slice(0, 200)}` };
    }
    return { ok: true, messageId: json.key?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ─────────────────────────────────────────────────────────────────
// Handler principal
// ─────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const baseUrl = Deno.env.get('EVOLUTION_BASE_URL');
  const apiKey = Deno.env.get('EVOLUTION_API_KEY');
  const instance = Deno.env.get('EVOLUTION_INSTANCE_NAME') ?? 'arkana';
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!baseUrl || !apiKey || !supabaseUrl || !serviceKey) {
    return new Response(
      JSON.stringify({ error: 'faltan variables de entorno' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400 });
  }

  const evento = detectarEvento(payload);
  if (!evento || !payload.record) {
    return new Response(
      JSON.stringify({ skipped: true, reason: 'no es un evento que notifique' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const cita = payload.record;
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Cargar negocio + servicio en paralelo
  const [{ data: negocio }, { data: servicio }] = await Promise.all([
    supabase
      .from('negocios')
      .select('id, nombre, telefono, whatsapp_activado')
      .eq('id', cita.negocio_id)
      .maybeSingle(),
    supabase.from('servicios').select('id, nombre').eq('id', cita.servicio_id).maybeSingle(),
  ]);

  if (!negocio || !servicio) {
    return new Response(
      JSON.stringify({ skipped: true, reason: 'negocio o servicio no encontrado' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Decidir destinatario, número y plantilla
  let destinatarioTipo: 'negocio' | 'cliente';
  let destinatarioTelefono: string | null;
  let optIn = true;
  let cuerpo: string;

  const fechaFmt = formatFecha(cita.fecha);
  const horaFmt = formatHora(cita.hora_inicio);

  if (evento === 'new') {
    destinatarioTipo = 'negocio';
    destinatarioTelefono = normalizarTelefono(negocio.telefono);
    optIn = negocio.whatsapp_activado ?? true;
    cuerpo = tplNuevaCitaNegocio({
      clientName: cita.cliente_nombre,
      service: servicio.nombre,
      date: fechaFmt,
      time: horaFmt,
    });
  } else {
    destinatarioTipo = 'cliente';
    destinatarioTelefono = normalizarTelefono(cita.cliente_telefono);

    // Si el cliente está registrado, respetar su opt-in
    if (cita.cliente_id) {
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('whatsapp_activado')
        .eq('id', cita.cliente_id)
        .maybeSingle();
      optIn = usuario?.whatsapp_activado ?? true;
    }

    if (evento === 'confirmed') {
      cuerpo = tplConfirmadaCliente({
        clientName: cita.cliente_nombre,
        businessName: negocio.nombre,
        service: servicio.nombre,
        date: fechaFmt,
        time: horaFmt,
      });
    } else if (evento === 'cancelled') {
      cuerpo = tplCanceladaCliente({
        clientName: cita.cliente_nombre,
        businessName: negocio.nombre,
        date: fechaFmt,
        time: horaFmt,
      });
    } else {
      // rescheduled — necesitamos old_record para fecha/hora anteriores
      const old = payload.old_record;
      cuerpo = tplReagendadaCliente({
        clientName: cita.cliente_nombre,
        businessName: negocio.nombre,
        oldDate: formatFecha(old?.fecha ?? cita.fecha_anterior ?? cita.fecha),
        oldTime: formatHora(old?.hora_inicio ?? cita.hora_inicio_anterior ?? cita.hora_inicio),
        newDate: fechaFmt,
        newTime: horaFmt,
      });
    }
  }

  // Guards: opt-in y teléfono válido
  if (!optIn) {
    return new Response(
      JSON.stringify({ skipped: true, reason: 'destinatario tiene WhatsApp desactivado' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }
  if (!destinatarioTelefono) {
    return new Response(
      JSON.stringify({ skipped: true, reason: 'sin teléfono válido' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Insertar fila de log como 'pending'
  const { data: logRow } = await supabase
    .from('whatsapp_log')
    .insert({
      cita_id: cita.id,
      destinatario_tipo: destinatarioTipo,
      destinatario_telefono: destinatarioTelefono,
      evento,
      cuerpo,
      estado: 'pending',
      intentos: 1,
    })
    .select('id')
    .single();

  // Enviar a Evolution
  const result = await sendWhatsApp({
    baseUrl,
    apiKey,
    instance,
    number: destinatarioTelefono,
    text: cuerpo,
  });

  // Marcar log según resultado
  if (logRow) {
    if (result.ok) {
      await supabase
        .from('whatsapp_log')
        .update({
          estado: 'sent',
          sent_at: new Date().toISOString(),
          provider_message_id: result.messageId ?? null,
        })
        .eq('id', logRow.id);
    } else {
      await supabase
        .from('whatsapp_log')
        .update({ estado: 'failed', error: result.error ?? 'error desconocido' })
        .eq('id', logRow.id);
    }
  }

  return new Response(
    JSON.stringify({
      ok: result.ok,
      evento,
      destinatario_tipo: destinatarioTipo,
      messageId: result.messageId,
      error: result.error,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );
});
