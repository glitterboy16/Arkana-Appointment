# Notificaciones WhatsApp con Evolution API

Esta es la integración que dispara WhatsApp automáticos cuando se crean,
confirman, cancelan o reagendan citas en Arkana. Va por Evolution API
(Baileys) hosteado en Railway. Es una solución puente: a largo plazo se
sustituirá por Cloud API oficial de Meta cuando la verificación
empresarial esté aprobada.

---

## Arquitectura

```
[Cliente reserva cita]
         │
         ▼
   Supabase: INSERT en tabla citas
         │
         ▼
   Database Webhook  ──────────►  Edge Function send-whatsapp
                                          │
                                          ▼
                                 Evolution API (Railway)
                                          │
                                          ▼
                                   WhatsApp Business
                                          │
                                          ▼
                                  Destinatario final
```

- **Migración 013** crea `whatsapp_log` y columnas auxiliares.
- **Edge Function `send-whatsapp`** recibe el webhook de Supabase, decide
  a quién mandar y qué plantilla, llama a Evolution API y persiste el
  resultado en `whatsapp_log`.
- **Database Webhook** se configura desde el panel de Supabase y dispara
  la function en cada INSERT/UPDATE de `citas`.

---

## Pasos para activar (orden importante)

### Paso 1 — Aplicar la migración 013

1. Abre el SQL Editor de Supabase
2. Copia el contenido de `supabase/migrations/013_whatsapp_notificaciones.sql`
3. Pega y ejecuta
4. La consulta final debe devolver `1 | 1 | 1` (las tres comprobaciones a TRUE)

### Paso 2 — Configurar secrets en Supabase

Necesitas el CLI de Supabase autenticado, o hacerlo por el panel.

**Vía CLI** (recomendado):

```bash
supabase secrets set \
  EVOLUTION_BASE_URL=https://evolution-api-production-bbc5.up.railway.app \
  EVOLUTION_API_KEY=40ae06d8f3c6dc3da256a219adf2e1f0f64a6c69e937ba5aa3b1853eb7187102 \
  EVOLUTION_INSTANCE_NAME=arkana
```

**Vía panel web**: Project Settings → Edge Functions → Secrets → añade
las tres variables anteriores.

> Si el subdominio de Railway cambia (al disconnect/reconnect del
> source), actualiza `EVOLUTION_BASE_URL` aquí también.

### Paso 3 — Deploy de la Edge Function

```bash
supabase functions deploy send-whatsapp --no-verify-jwt
```

`--no-verify-jwt` porque el webhook viene del propio Supabase con su
service-role y no usa JWT de usuario.

Verifica que está desplegada:

```bash
supabase functions list
```

### Paso 4 — Crear el Database Webhook en Supabase

Panel de Supabase → Database → Webhooks → **Create a new hook**:

| Campo | Valor |
|-------|-------|
| Name | `citas_whatsapp_notificaciones` |
| Table | `citas` |
| Events | ✅ INSERT, ✅ UPDATE |
| Type | **HTTP Request** |
| Method | POST |
| URL | `https://<TU-PROYECTO>.supabase.co/functions/v1/send-whatsapp` |
| HTTP Headers | `Content-Type: application/json` (ya viene)<br>`Authorization: Bearer <SERVICE_ROLE_KEY>` |
| Timeout | 5000 ms |

La URL exacta la obtienes del paso 3 (`supabase functions list`) o del
panel: Edge Functions → `send-whatsapp` → URL.

Guarda. A partir de ese momento, cada cambio en `citas` dispara la
notificación.

### Paso 5 — Test E2E

1. **Nueva cita** — desde una página de reserva pública (`/r/<slug>`),
   crea una cita con tu propio número de móvil en el campo "Teléfono".
   El número del negocio en `negocios.telefono` debe ser tu otro móvil
   o un móvil de prueba.
   - Resultado esperado: llega WhatsApp al **negocio** con plantilla
     "Nueva cita en Arkana".

2. **Confirmar** — desde el panel de negocio (`/panel/citas`), pulsa
   "Confirmar" en la cita recién creada.
   - Resultado esperado: llega WhatsApp al **cliente** con plantilla
     "Tu cita ha sido confirmada".

3. **Reagendar** — actualiza `fecha` u `hora_inicio` de la cita
   (puedes hacerlo desde el SQL Editor temporalmente, o crearemos UI
   para reagendar en una iteración siguiente).
   - Resultado esperado: llega WhatsApp al **cliente** con plantilla
     "Cita reagendada" mostrando antes y ahora.

4. **Cancelar** — desde el panel de negocio, pulsa "Cancelar".
   - Resultado esperado: llega WhatsApp al **cliente** con plantilla
     "Cita cancelada".

5. **Verificar `whatsapp_log`**: cada uno de los 4 anteriores debe
   haber generado una fila con `estado = 'sent'`:

   ```sql
   select id, evento, destinatario_tipo, estado, error, sent_at
     from whatsapp_log
    order by created_at desc
    limit 10;
   ```

---

## Troubleshooting

### El webhook se dispara pero no llega WhatsApp

- Revisa logs de la function: `supabase functions logs send-whatsapp`
- Si dice `Evolution 4xx` → verifica que la instancia `arkana` en
  Railway sigue en estado `open` (manager o `GET /instance/fetchInstances`)
- Si dice `Evolution 5xx` → Evolution caído. Reinicia el servicio en Railway.

### El webhook no se dispara

- Comprueba en el panel: Database → Webhooks → click en el hook →
  pestaña "Logs". Si está en rojo, lee el error.
- Verifica que la URL de la function es la correcta.

### Los WhatsApp dejan de llegar de repente

- Es probable que **Meta haya actualizado la versión de WhatsApp Web**
  y la variable `CONFIG_SESSION_PHONE_VERSION` en Railway haya quedado
  obsoleta.
- Fix: abre `web.whatsapp.com` → menú → Configuración → Ayuda → copia
  la nueva versión → en Railway, variable `CONFIG_SESSION_PHONE_VERSION`
  → pega → redeploy.

### Quiero desactivar WhatsApp para un negocio o cliente concreto

```sql
-- Negocio
update negocios set whatsapp_activado = false where id = '<negocio_id>';

-- Cliente registrado
update usuarios set whatsapp_activado = false where id = '<usuario_id>';
```

La Edge Function lo respeta automáticamente.

---

## Coste estimado

- Railway (Evolution + Postgres + Redis): ~5-10 USD/mes
- Supabase Edge Functions: gratis hasta 500k invocaciones/mes
- **Total: ~10 USD/mes** mientras dure el puente

Cuando se migre a Cloud API oficial, Evolution puede pausarse → 0 USD.
