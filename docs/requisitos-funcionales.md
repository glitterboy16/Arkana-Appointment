# Requisitos funcionales

Los requisitos funcionales describen **qué hace** el sistema. Se agrupan por módulo y se numeran con el prefijo `RF-XX`.

> · ✅ Entregado en el MVP
> · 🟡 Entregado de forma parcial (con notas)
> · 🔵 Pospuesto

## 1.1. Módulo de autenticación y usuarios

| ID | Requisito | Estado | Rol |
|---|---|---|---|
| RF-01 | Registro de un nuevo **negocio** aportando email, contraseña, nombre y nombre comercial. | ✅ | Empresa |
| RF-02 | Registro de un nuevo **cliente** aportando email, contraseña, nombre y teléfono. | ✅ | Cliente |
| RF-03 | **Inicio de sesión** con email y contraseña. | ✅ | Todos |
| RF-04 | **Cierre de sesión** invalidando la sesión activa. | ✅ | Todos |
| RF-05 | **Recuperación de contraseña** mediante enlace al correo. | ✅ | Todos |
| RF-06 | **Actualización de contraseña** desde el enlace recibido. | ✅ | Todos |
| RF-07 | **Modificación de datos personales** (nombre, teléfono, foto de perfil). | ✅ | Cliente, Negocio |
| RF-08 | Validación de email + contraseña mínima de 8 caracteres (regla de Supabase Auth). | ✅ La política de contraseña estricta (mayúscula + minúscula + dígito)  | Todos |
| RF-09 | Asignación de **rol** al iniciar sesión y redirección al panel adecuado. El admin entra con cualquier selector y se redirige a `/admin`. | ✅ | Todos |

## 2.2. Módulo de perfil del negocio

| ID | Requisito | Estado |
|---|---|---|
| RF-10 | Edición del **perfil público**: nombre, descripción, categoría, dirección, teléfono, ubicación en mapa, logotipo y **galería de fotos**. | ✅ |
| RF-11 | **Catálogo de servicios** con nombre, duración y precio. | ✅ |
| RF-12 | **Activar / desactivar** servicios sin borrarlos. | ✅ |
| RF-13 | Generación automática de **código QR** por negocio (PNG con logo). | ✅ |
| RF-14 | **Descarga del QR** desde el panel del negocio (PNG). | ✅ |
| RF-15 | **URL pública única** por negocio: `/n/:slug`. | ✅ |

## 2.3. Módulo de disponibilidad horaria

| ID | Requisito | Estado |
|---|---|---|
| RF-16 | Definir **horario semanal** indicando franjas por día. | ✅ |
| RF-17 | **Bloquear días específicos** (vacaciones, festivos). | ✅ |
| RF-18 | Cálculo de **disponibilidad real** cruzando horario, duración del servicio y citas ya reservadas. | ✅ |
| RF-19 | Mostrar al cliente solo **franjas libres** para el servicio elegido. | ✅ |
| RF-20 | Prevención de **reservas solapadas**. | ✅ |

## 2.4. Módulo de reservas (cliente)

| ID | Requisito | Estado |
|---|---|---|
| RF-21 | Acceso al **perfil público** del negocio via QR o URL directa. | ✅ |
| RF-22 | Consulta de **servicios** con duración y precio. | ✅ |
| RF-23 | **Reserva de cita** seleccionando servicio, fecha y franja. | ✅ |
| RF-24 | **Reserva como invitado** sin cuenta (nombre, teléfono, email). | ✅ |
| RF-25 | **Confirmación por WhatsApp** al cliente. | ✅ |
| RF-26 | **Cancelación** de la propia cita desde el portal del cliente. | ✅ |
| RF-27 | Estado de la cita visible para el cliente (`nueva`, `pendiente`, `confirmada`, `cancelada`, `completada`). | ✅ |

## 2.5. Módulo de panel del negocio

| ID | Requisito | Estado |
|---|---|---|
| RF-28 | **Listado de citas** filtrable por fecha y estado. | ✅ |
| RF-29 | **Confirmar, reagendar o cancelar** una cita. | ✅ |
| RF-30 | **Marcar una cita como completada** tras la atención. | ✅ |
| RF-31 | **Detalle de la cita** con datos del cliente y servicio. | ✅ |
| RF-32 | Notificación por WhatsApp al cambiar el estado. | ✅ Sustituido por notificación interna en tiempo real (Supabase Realtime + polling de respaldo). |
| RF-33 | Vista **calendario** día / semana. |✅ La pantalla de citas usa agrupación por día con filtros; la vista calendario clásica queda en roadmap. |

## 2.6. Módulo de administración

El administrador tiene **acceso CRUD completo** sobre usuarios y negocios.

| ID | Requisito | Estado |
|---|---|---|
| RF-34 | **Listar todos los negocios** con búsqueda y filtros. | ✅ |
| RF-35 | **Crear, editar, suspender o eliminar** un negocio. | ✅ |
| RF-36 | **Listar todos los usuarios** (clientes, negocios y otros admins) con búsqueda y filtros por rol. | ✅ |
| RF-37 | **Crear, editar, desactivar o eliminar por completo** usuarios. La eliminación total borra al usuario de `auth.users`, `public.usuarios` y sus negocios asociados en una sola transacción atómica. | ✅ |
| RF-38 | **Métricas agregadas** en el dashboard: clientes activos, negocios activos, total de usuarios, desactivados, gráfica de altas en los últimos 30 días. | ✅ |

## 2.7. Módulo de notificaciones

| ID | Requisito | Estado |
|---|---|---|
| RF-39 | Notificación al **crear** una cita (al negocio en tiempo real). | ✅ Vía Supabase Realtime. |
| RF-40 | Notificación al **modificar el estado** de una cita (al cliente). | ✅ Vía Supabase Realtime. |
| RF-41 | Notificación al **cancelar** la cita (a ambas partes). | ✅ Vía Supabase Realtime. |


## 2.8. Módulo legal y RGPD

| ID | Requisito | Estado |
|---|---|---|
| RF-42 | **Política de privacidad** accesible en `/privacidad`. | ✅ |
| RF-43 | **Términos de uso** accesibles en `/terminos`. | ✅ |
| RF-44 | **Banner de cookies** con opt-in persistido en `localStorage`. | ✅ |
| RF-45 | **Derecho al olvido**: el usuario puede solicitar la baja y el admin elimina la cuenta por completo. | ✅ |

