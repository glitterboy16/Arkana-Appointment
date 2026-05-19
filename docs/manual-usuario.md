# Manual de usuario

Guía práctica de uso de Arkana Appointments para los tres perfiles de la plataforma: **cliente**, **negocio** y **administrador**.

URL de la aplicación: [https://www.arkana-appointments.com](https://www.arkana-appointments.com)

---

## 1. Cliente

### 1.1. Reservar una cita escaneando el QR de un negocio

1. Escanear el QR del negocio con la cámara del móvil. El navegador abre la URL `/n/<slug-del-negocio>`.
2. La página muestra el nombre del negocio, su ubicación en el mapa, sus servicios y la galería de fotos.
3. Pulsar **Reservar cita** y seguir los pasos:
   1. Elegir un **servicio**.
   2. Elegir una **fecha y franja** entre las que aparecen libres.
   3. Introducir **nombre, teléfono y correo** (si no se ha iniciado sesión).
4. Pulsar **Confirmar**. El sistema crea la cita en estado **Nueva** y muestra el resguardo.

> No hace falta crear cuenta para reservar. La reserva queda asociada al teléfono y correo que se introduzcan.

### 1.2. Crear cuenta de cliente

1. Pulsar **Iniciar sesión** en la esquina superior derecha.
2. Pulsar **Regístrate** y rellenar nombre, teléfono, email y contraseña.
3. El selector debe quedar en **Cliente** (es la opción por defecto).

### 1.3. Portal del cliente (`/app`)

Disponible al iniciar sesión con un usuario cliente:

| Sección | Qué hace |
|---|---|
| **Buscar** | Lista de negocios con buscador por nombre, categoría, servicio o dirección. |
| **Mis citas** | Citas próximas y pasadas con filtros. Permite **cancelar** una cita próxima desde la propia tarjeta. |
| **Notificaciones** | Actividad reciente: confirmaciones, reagendamientos y cancelaciones del negocio. |
| **Perfil** | Editar nombre, teléfono y foto de perfil. |
| **Configuración** | Cambiar entre tema oscuro y claro. Cerrar sesión. |

---

## 2. Negocio

### 2.1. Crear cuenta de negocio

1. Pulsar **Crear cuenta gratis** en la landing o ir a `/registro`.
2. Cambiar el selector a **Negocio**.
3. Rellenar nombre del propietario, email, contraseña y nombre comercial del negocio.

Al confirmar, el sistema crea el usuario y un negocio con un **slug** público derivado de su nombre (`/n/clinica-dental-sonrisa-ab12`, por ejemplo).

### 2.2. Panel del negocio (`/panel`)

| Sección | Qué hace |
|---|---|
| **Panel** | Resumen del día: citas confirmadas hoy, esta semana y este mes; gráfica de los últimos 12 días. |
| **Citas** | Listado agrupado por día (`Hoy`, `Mañana`, fechas). En cada fila el negocio puede **Confirmar**, **Marcar completada**, **Reagendar** o **Cancelar** la cita. |
| **Perfil** | Editar nombre, categoría, descripción, dirección, teléfono, logotipo, **galería de fotos**, ubicación en mapa y servicios. |
| **Estadísticas** | Vista detallada de citas y servicios más reservados. |
| **QR** | Vista del código QR del negocio con logo de Arkana. Botón de descarga en PNG para imprimir. |
| **Configuración** | Preferencias generales del panel. |

### 2.3. Gestionar la disponibilidad horaria

Desde **Perfil → Disponibilidad**, el negocio define para cada día de la semana las franjas en las que admite citas. La aplicación cruza esa información con la duración de cada servicio y las citas ya reservadas, y muestra al cliente solo los huecos libres.

### 2.4. Notificaciones en tiempo real

Cuando un cliente reserva, la cita aparece **inmediatamente** en el panel del negocio (Supabase Realtime + un polling de respaldo cada 10 s). Lo mismo en sentido inverso: si el negocio confirma o cancela, el cliente lo ve sin recargar.

---

## 3. Administrador

### 3.1. Acceso

Iniciar sesión con un usuario de rol **admin** desde `/iniciarSesion`. El selector de rol (Negocio/Cliente) es indiferente: la app detecta el rol real y redirige a `/admin`.

### 3.2. Dashboard (`/admin`)

- **Tarjetas resumen**: clientes activos, negocios activos, total de usuarios y usuarios desactivados.
- **Gráfica** de altas en los últimos 30 días (BarChart apilado: clientes + negocios).
- Botón **Refrescar** para recargar los datos sin recargar la página.

### 3.3. Gestión de usuarios (`/admin/usuarios`)

| Acción | Qué hace |
|---|---|
| **Filtros** | `Todos`, `Cliente`, `Negocio`, `Admin`. |
| **Búsqueda** | Por nombre, email o teléfono. |
| **Crear usuario** | Modal con rol seleccionable. Si es **negocio**, también pide el nombre comercial y crea automáticamente la fila en `negocios`. |
| **Editar** | Modal con nombre, email y teléfono. |
| **Desactivar / Activar** | Acción reversible. El usuario desactivado no puede iniciar sesión pero sus datos se conservan. |
| **Eliminar por completo** | Acción irreversible. Borra al usuario de `auth.users`, `public.usuarios` y todos sus negocios asociados (incluyendo servicios, horarios, fotos y citas) en una sola transacción. |

> Los administradores no pueden eliminarse a sí mismos ni eliminar a otros admins desde la UI: la protección está aplicada en la propia función Postgres `admin_delete_usuario`.

### 3.4. Errores de plataforma

Cualquier error de auth, perfil, reserva o panel queda registrado en la tabla `error_logs` con contexto, mensaje y URL. El admin puede consultarlos directamente desde el SQL Editor de Supabase si necesita depurar un incidente.

---

## 4. Preguntas frecuentes

**¿Cómo recupero mi contraseña?**
En el MVP la recuperación de contraseña por correo está en roadmap. Mientras tanto, contactar al administrador para que la restablezca desde el panel.

**¿Puedo cambiar el idioma?**
La aplicación se entrega íntegramente en español. El soporte multiidioma (español + inglés) está pospuesto a una fase posterior.

**¿Por qué no recibo WhatsApp al reservar?**
El canal WhatsApp también está pospuesto. Las notificaciones se entregan dentro de la propia aplicación en tiempo real para el cliente y el negocio.

**¿Qué pasa si elimino mi cuenta?**
Se borran de forma irreversible todos tus datos: cuenta de acceso, perfil, negocios (si eres negocio), servicios, horarios, citas y fotos. Es el equivalente al **derecho al olvido** del RGPD.
