# Fase 3 — Paneles y notificaciones internas

**Objetivo:** Gestión completa para el negocio y el administrador. Notificaciones en tiempo real desde la propia plataforma.

**Estado:** ✅ Completada (con notas: WhatsApp y i18n pospuestos)
**Periodo:** mayo 2026
**Requisitos cubiertos:** RF-28 → RF-31, RF-34 → RF-38, RF-39 → RF-41 (vía Realtime), RNF-14, RNF-19, RNF-23

---

## Panel del negocio

| ID | Descripción | Commit ancla |
|---|---|---|
| RF-28 | Listado de citas filtrable por fecha y estado (`Todas`, `Confirmadas`, `Pendientes`, `Nuevas`, `Completadas`, `Canceladas`). | `203386d`, `e2b36be` |
| RF-29 | Confirmar, reagendar o cancelar una cita desde la propia fila. | `203386d` |
| RF-30 | Marcar una cita como **completada** tras la atención. | `92b068c` |
| RF-31 | Detalle de la cita con datos del cliente, foto, servicio y precio. | `203386d` |
| RF-33 | Vista calendario (día / semana). | 🔵 Pospuesto. El listado agrupado por día con cabeceras "Hoy / Mañana / fecha" cubre el caso central. |

Adicional:

- **Notificaciones en tiempo real**: cada cita nueva entra al panel sin recargar (Supabase Realtime + polling de respaldo a 10 s). Commit `1b9148a`.
- **Estadísticas del negocio**: métricas de citas hoy, semana, mes y gráfica de los últimos 12 días. Commit `e4a9ae5`.
- **QR del negocio**: vista descargable con logo de Arkana. Commit `e4a9ae5`.
- **MapPicker** para fijar la ubicación del negocio en el mapa. Commit `e4a9ae5`.

---

## Panel del administrador

| ID | Descripción | Commit ancla |
|---|---|---|
| RF-34 | Listado de todos los negocios. | `cb9d8dc` |
| RF-35 | Crear, editar, suspender o eliminar negocios. | `cb9d8dc`, `c6f5d84` |
| RF-36 | Listado de usuarios con búsqueda y filtros por rol. | `cb9d8dc` |
| RF-37 | CRUD completo de usuarios + dos operaciones diferenciadas: **Desactivar** (reversible) y **Eliminar por completo** (borra `auth.users`, `public.usuarios` y negocios asociados en una sola transacción RPC). | `cb9d8dc`, `c6f5d84` |
| RF-38 | Dashboard con tarjetas (clientes activos, negocios activos, total de usuarios, desactivados) y gráfica `BarChart` de altas en los últimos 30 días. | `cb9d8dc`, último commit del dashboard. |

### Función Postgres `admin_delete_usuario` (migración 012)

```sql
create or replace function public.admin_delete_usuario(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  if auth.uid() is null then raise exception 'No autenticado'; end if;
  if (select rol from public.usuarios where id = auth.uid()) <> 'admin' then
    raise exception 'Solo un admin puede eliminar usuarios';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'Un admin no puede eliminarse a sí mismo';
  end if;

  delete from public.negocios where usuario_id = p_user_id;
  delete from public.usuarios where id = p_user_id;
  delete from auth.users where id = p_user_id;
end;
$$;
```

---

## Notificaciones

| ID | Original (WhatsApp) | Solución entregada |
|---|---|---|
| RF-39 | WhatsApp al crear cita. | Notificación interna en tiempo real para el negocio (Realtime). |
| RF-40 | WhatsApp al cambiar estado. | Notificación interna en tiempo real para el cliente. |
| RF-41 | WhatsApp al cancelar. | Notificación interna para ambas partes. |
| RF-42 | Plantillas WhatsApp editables. | 🔵 Pospuesto. |

El canal WhatsApp queda como evolución natural: la lógica de notificación está centralizada en `NotificationsContext`, lo que permite añadir un nuevo transporte (Edge Function + Twilio o WhatsApp Cloud API) sin tocar los componentes.

---

## Registro de errores

- Tabla `error_logs` (migración 008): la app inserta filas cuando algo falla en auth, perfil, gestión de citas, etc.
- Helper `src/lib/errorLogger.ts` con la función `logError(contexto, err, detalle?)`.
- El admin podía leer los últimos 50 eventos desde su dashboard. **En la última iteración (commit del dashboard refactor) se eliminó la card de errores del dashboard**: los logs siguen escribiéndose, pero su lectura queda en SQL/consola para no saturar al admin con ruido técnico.

---

## Internacionalización (RF-43, RF-44, RF-45)

🔵 Pospuesto. El MVP se entrega íntegramente en español; los textos están centralizados en componentes, lo que permite envolverlos con `t()` en una segunda fase sin reescribir vistas.
