# Notificaciones WhatsApp

Arkana envía WhatsApp automáticos cuando se crean, confirman, cancelan o reagendan citas. La integración usa **Evolution API** (basado en Baileys) alojado en Railway. Es una solución puente: si en el futuro se obtiene verificación empresarial de Meta, se reemplaza por la Cloud API oficial.

---

## Cómo funciona

```
Cliente reserva cita
       │
       ▼
  Supabase: INSERT/UPDATE en citas
       │
       ▼
  Database Webhook ──► Edge Function send-whatsapp
                               │
                               ▼
                       Evolution API (Railway)
                               │
                               ▼
                        WhatsApp Business
```

- El **Database Webhook** de Supabase dispara la Edge Function en cada INSERT o UPDATE de la tabla `citas`.
- La **Edge Function** decide a quién mandar el mensaje (negocio o cliente) y qué plantilla usar según el evento.
- **Evolution API** actúa como puente con WhatsApp Web mediante el número de teléfono del negocio conectado.
- Cada envío queda registrado en la tabla `whatsapp_log` con estado (`sent` / `error`).

---

## Configuración necesaria

### 1. Variables de entorno en Supabase Edge Functions

Desde el panel de Supabase → Project Settings → Edge Functions → Secrets, añade:

| Variable | Descripción |
|---|---|
| `EVOLUTION_BASE_URL` | URL del servicio Evolution en Railway |
| `EVOLUTION_API_KEY` | Clave de autenticación de Evolution |
| `EVOLUTION_INSTANCE_NAME` | Nombre de la instancia conectada al número de WhatsApp |

### 2. Deploy de la Edge Function

```bash
supabase functions deploy send-whatsapp --no-verify-jwt
```

El flag `--no-verify-jwt` es necesario porque el webhook llega del propio Supabase usando la service role key, no un JWT de usuario.

### 3. Database Webhook en Supabase

Panel → Database → Webhooks → Create a new hook:

| Campo | Valor |
|---|---|
| Table | `citas` |
| Events | INSERT, UPDATE |
| Type | HTTP Request (POST) |
| URL | URL de la función `send-whatsapp` |
| Authorization | `Bearer <SERVICE_ROLE_KEY>` |

---

## Activar / desactivar por negocio o cliente

```sql
-- Desactivar para un negocio
UPDATE negocios SET whatsapp_activado = false WHERE id = '<id>';

-- Reactivar
UPDATE negocios SET whatsapp_activado = true WHERE id = '<id>';
```

La Edge Function respeta el campo `whatsapp_activado` automáticamente.

---

## Troubleshooting

| Síntoma | Causa probable | Solución |
|---|---|---|
| Webhook disparado pero no llega WhatsApp | Instancia desconectada en Railway | Verificar estado en el manager de Evolution; reconectar si es necesario |
| Error 4xx de Evolution | API key incorrecta o instancia inactiva | Revisar secrets en Supabase y estado de la instancia |
| Los mensajes dejan de llegar de repente | Meta actualizó la versión de WhatsApp Web | Copiar la nueva versión desde `web.whatsapp.com → Configuración → Ayuda` y actualizar la variable `CONFIG_SESSION_PHONE_VERSION` en Railway |
| Webhook no se dispara | URL incorrecta o service role key inválida | Revisar logs en Database → Webhooks → pestaña Logs |

Para ver los logs de la función:

```bash
supabase functions logs send-whatsapp
```

---

## Coste

- Railway (Evolution + dependencias): ~5 USD/mes
- Supabase Edge Functions: gratuito hasta 500 k invocaciones/mes
