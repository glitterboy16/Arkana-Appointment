# Manual de usuario

Guía práctica de uso de Arkana Appointments para los tres perfiles de la plataforma: **cliente**, **negocio** y **administrador**.

URL de la aplicación: [https://www.arkana-appointments.com](https://www.arkana-appointments.com)

---

## 1. Cliente

### 1.1. Reservar una cita escaneando el QR de un negocio

1. Escanear el QR del negocio con la cámara del móvil. El navegador abre la página del negocio.
2. La página muestra el nombre del negocio, su ubicación en el mapa, sus servicios y la galería de fotos.
3. Pulsar **Reservar cita** y seguir los pasos:
   1. Elegir un **servicio**.
   2. Elegir una **fecha y franja** entre las que aparecen libres.
   3. Introducir **nombre, teléfono y correo** (si no se ha iniciado sesión).
4. Pulsar **Confirmar**. El sistema crea la cita en estado **Nueva** y muestra el resguardo.

> No hace falta crear cuenta para reservar. La reserva queda asociada al teléfono y correo introducidos.

### 1.2. Crear cuenta de cliente

1. Pulsar **Iniciar sesión** en la esquina superior derecha.
2. Pulsar **Regístrate** y rellenar nombre, teléfono, email y contraseña.
3. El selector debe quedar en **Cliente** (opción por defecto).
4. Revisar la bandeja de entrada: llegará un email de verificación. Hay que confirmar el correo antes de poder acceder al portal.

### 1.3. Portal del cliente (`/app`)

| Sección | Qué hace |
|---|---|
| **Buscar** | Lista de negocios con buscador por nombre, categoría, servicio o dirección. |
| **Mis citas** | Citas próximas y pasadas. Permite **cancelar** una cita próxima desde la propia tarjeta. |
| **Notificaciones** | Actividad reciente: confirmaciones, reagendamientos y cancelaciones del negocio. |
| **Perfil** | Editar nombre, teléfono y foto de perfil. |
| **Configuración** | Cambiar email, cambiar contraseña, alternar tema claro/oscuro, cerrar sesión. |

---

## 2. Negocio

### 2.1. Crear cuenta de negocio

1. Pulsar **Crear cuenta gratis** en la landing o ir a `/registro`.
2. Cambiar el selector a **Negocio**.
3. Rellenar nombre del propietario, teléfono, email, contraseña y nombre comercial del negocio.
4. Verificar el email antes de acceder al panel (llega un enlace de confirmación).

Al confirmar, el sistema crea el usuario y un negocio con un **slug** público derivado de su nombre.

### 2.2. Panel del negocio (`/panel`)

| Sección | Qué hace |
|---|---|
| **Panel** | Resumen del día: citas confirmadas hoy, esta semana y este mes; gráfica de los últimos 12 días. |
| **Citas** | Listado filtrable por estado (Todas, Confirmadas, Pendientes, Nuevas, Completadas, Canceladas). En cada fila el negocio puede **Confirmar**, **Marcar completada**, **Reagendar** o **Cancelar**. |
| **Perfil** | Editar nombre, categoría, descripción, dirección, teléfono, logotipo, galería, ubicación en mapa y servicios. |
| **Estadísticas** | Vista detallada de citas y servicios más reservados. |
| **QR** | Código QR del negocio con logo de Arkana. Botón de descarga en PNG para imprimir. |
| **Configuración** | Cambiar email, cambiar contraseña y preferencias del panel. |

### 2.3. Gestionar la disponibilidad horaria

Desde **Perfil → Disponibilidad**, el negocio define para cada día de la semana las franjas en las que admite citas. La app cruza esa información con la duración de cada servicio y las citas ya reservadas, mostrando al cliente solo los huecos libres.

### 2.4. Notificaciones en tiempo real

Cuando un cliente reserva, la cita aparece **inmediatamente** en el panel (Supabase Realtime + polling de respaldo cada 10 s). Lo mismo en sentido inverso: si el negocio confirma o cancela, el cliente lo ve sin recargar.

---

## 3. Administrador

### 3.1. Acceso

Iniciar sesión con un usuario de rol **admin** desde `/iniciarSesion`. El selector de rol (Negocio/Cliente) es indiferente: la app detecta el rol real y redirige a `/admin`.

### 3.2. Dashboard (`/admin`)

- **Tarjetas resumen**: clientes activos, negocios activos, total de usuarios y usuarios desactivados.
- **Gráfica** de altas en los últimos 30 días.
- Botón **Refrescar** para recargar datos sin recargar la página.

### 3.3. Gestión de usuarios (`/admin/usuarios`)

| Acción | Qué hace |
|---|---|
| **Filtros** | Por rol: Todos, Cliente, Negocio, Admin. |
| **Búsqueda** | Por nombre, email o teléfono. |
| **Crear usuario** | Modal con rol seleccionable. Si es **negocio**, también pide el nombre comercial. El usuario queda verificado y puede iniciar sesión de inmediato. |
| **Editar** | Modal con nombre, email y teléfono. |
| **Desactivar / Activar** | Reversible. El usuario desactivado no puede iniciar sesión pero sus datos se conservan. |
| **Eliminar** | Irreversible. Borra al usuario de auth, su perfil y todos sus negocios asociados en una sola transacción. |

> Los administradores no pueden eliminarse a sí mismos ni eliminar a otros admins desde la UI.

---

## 4. Preguntas frecuentes

**¿Cómo recupero mi contraseña?**
Desde `/iniciarSesion` → **¿Olvidaste tu contraseña?**. Introduce tu email y recibirás un enlace para elegir una contraseña nueva. El enlace caduca en 1 hora.

**¿Puedo cambiar mi email o contraseña?**
Sí, desde **Configuración** dentro de la app (tanto en el portal de cliente como en el panel del negocio).

**¿Por qué me pide verificar el email?**
Es necesario confirmar el correo antes de acceder a la app. Revisa tu bandeja de entrada (y la carpeta de spam) tras registrarte.

**¿Puedo cambiar el idioma?**
La app se entrega íntegramente en español. El soporte multiidioma está pospuesto.

**¿Qué pasa si elimino mi cuenta?**
Se borran de forma irreversible todos tus datos: cuenta de acceso, perfil, negocios (si eres negocio), servicios, horarios, citas y fotos. Equivale al **derecho al olvido** del RGPD.
