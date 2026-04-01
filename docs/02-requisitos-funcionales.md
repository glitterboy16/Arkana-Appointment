# 2. Requisitos funcionales

Los requisitos funcionales describen **qué debe hacer** el sistema. Se agrupan por módulo y se numeran con el prefijo `RF-XX`.

## 2.1. Módulo de autenticación y usuarios

| ID | Requisito | Prioridad | Rol |
|---|---|---|---|
| RF-01 | El sistema debe permitir el registro de un nuevo **negocio** aportando email, contraseña, nombre comercial y rubro. | Alta | Empresa |
| RF-02 | El sistema debe permitir el registro de un nuevo **cliente** aportando email, contraseña y nombre. | Alta | Cliente |
| RF-03 | El sistema debe permitir **iniciar sesión** con email y contraseña. | Alta | Todos |
| RF-04 | El sistema debe permitir **cerrar sesión** invalidando la sesión activa. | Alta | Todos |
| RF-05 | El sistema debe permitir **recuperar la contraseña** mediante enlace enviado al correo electrónico. | Alta | Todos |
| RF-06 | El sistema debe permitir **actualizar la contraseña** desde el enlace recibido por correo. | Alta | Todos |
| RF-07 | El sistema debe permitir al usuario **modificar sus datos personales** (nombre, correo, avatar). | Media | Todos |
| RF-08 | El sistema debe validar el formato del email y exigir una contraseña mínima de 8 caracteres con al menos una mayúscula, una minúscula y un dígito. | Alta | Todos |
| RF-09 | El sistema debe aplicar el **rol** correspondiente al iniciar sesión (**cliente / empresa**) y redirigir al panel adecuado. El administrador puede seleccionar cualquiera de los dos tipos de acceso e iniciar sesión con sus credenciales para ser redirigido automáticamente a su panel de administración. | Alta | Todos |

## 2.2. Módulo de perfil del negocio

| ID | Requisito | Prioridad |
|---|---|---|
| RF-10 | El negocio debe poder editar su **perfil público**: nombre comercial, descripción, rubro, dirección, teléfono de contacto, horario general, logotipo y **galería de fotos de los servicios**. | Alta |
| RF-11 | El negocio debe poder definir un **catálogo de servicios** indicando nombre, descripción, duración y precio de cada uno. | Alta |
| RF-12 | El negocio debe poder **activar o desactivar** servicios sin eliminarlos. | Media |
| RF-13 | El sistema debe generar automáticamente un **código QR único** por negocio al completar su perfil. | Alta |
| RF-14 | El sistema debe permitir al negocio **descargar su código QR** en formato PNG y SVG. | Alta |
| RF-15 | Cada negocio debe tener una **URL pública única** del tipo `/negocio/:codigoQr`. | Alta |

## 2.3. Módulo de disponibilidad horaria

| ID | Requisito | Prioridad |
|---|---|---|
| RF-16 | El negocio debe poder definir su **horario semanal** indicando franjas horarias por día de la semana. | Alta |
| RF-17 | El negocio debe poder **bloquear días específicos** (vacaciones, festivos, imprevistos). | Alta |
| RF-18 | El sistema debe **calcular la disponibilidad real** cruzando el horario definido con las citas ya reservadas. | Alta |
| RF-19 | El sistema debe mostrar al cliente solo las **franjas libres** para el servicio seleccionado, teniendo en cuenta la duración del servicio. | Alta |
| RF-20 | El sistema no debe permitir **dos reservas solapadas** en la misma franja horaria. | Alta |

## 2.4. Módulo de reservas (cliente)

| ID | Requisito | Prioridad |
|---|---|---|
| RF-21 | El cliente debe poder acceder al **perfil público** de un negocio mediante su QR o URL directa. | Alta |
| RF-22 | El cliente debe poder **consultar los servicios** del negocio con su descripción, duración y precio. | Alta |
| RF-23 | El cliente debe poder **reservar una cita** seleccionando servicio, fecha y franja horaria disponible. | Alta |
| RF-24 | El cliente debe poder reservar **como invitado** (sin cuenta) aportando nombre, teléfono y correo. | Alta |
| RF-25 | El sistema debe enviar al cliente una **confirmación por WhatsApp** con los datos de la reserva, tanto si es usuario registrado como si reserva como invitado. Se usa WhatsApp como único canal de notificación para evitar lógica duplicada. | Alta |
| RF-26 | El cliente debe poder **cancelar su cita** antes de una ventana mínima configurable (por defecto 2 horas de antelación). | Alta |
| RF-27 | El sistema debe mostrar al cliente el estado de su cita: pendiente, confirmada, completada, cancelada. | Alta |

## 2.5. Módulo de panel del negocio

| ID | Requisito | Prioridad |
|---|---|---|
| RF-28 | El negocio debe poder ver un **listado de citas** filtrable por fecha y estado. | Alta |
| RF-29 | El negocio debe poder **confirmar, rechazar o cancelar** una cita. | Alta |
| RF-30 | El negocio debe poder **marcar una cita como completada** tras la atención. | Alta |
| RF-31 | El negocio debe poder ver el **detalle de una cita** con los datos del cliente y el servicio reservado. | Alta |
| RF-32 | Cada cambio de estado de una cita debe disparar una **notificación por WhatsApp** al cliente. | Alta |
| RF-33 | El negocio debe poder acceder a una **vista calendario** (día / semana) de sus citas. | Media |

## 2.6. Módulo de administración

El administrador tiene **acceso CRUD completo** sobre negocios y usuarios: puede crear, consultar, editar y eliminar cualquier registro de la plataforma.

| ID | Requisito | Prioridad |
|---|---|---|
| RF-34 | El administrador debe poder **listar todos los negocios** registrados con filtros por estado y rubro. | Alta |
| RF-35 | El administrador debe poder **crear, editar, suspender o eliminar** un negocio. | Alta |
| RF-36 | El administrador debe poder **listar todos los usuarios** (clientes y empresas). | Alta |
| RF-37 | El administrador debe poder **crear, editar o eliminar** usuarios de la plataforma. | Alta |
| RF-38 | El administrador debe poder consultar **métricas agregadas**: número de negocios activos, citas del día, usuarios nuevos. | Media |

## 2.7. Módulo de notificaciones WhatsApp

| ID | Requisito | Prioridad |
|---|---|---|
| RF-39 | El sistema debe enviar notificación al **crear** una cita (a cliente y negocio). | Alta |
| RF-40 | El sistema debe enviar notificación al **modificar el estado** de una cita. | Alta |
| RF-41 | El sistema debe enviar notificación al **cancelar** una cita (por cualquier parte). | Alta |
| RF-42 | Las plantillas de mensaje deben ser **editables** desde el panel del administrador. | Baja |

## 2.8. Módulo de internacionalización (i18n)

| ID | Requisito | Prioridad |
|---|---|---|
| RF-43 | La aplicación debe soportar **múltiples idiomas** (mínimo: español, inglés). | Alta |
| RF-44 | El sistema debe **detectar el idioma** del navegador y aplicarlo por defecto. | Media |
| RF-45 | El usuario debe poder **cambiar el idioma** manualmente y persistir la elección. | Alta |

## 2.9. Resumen de prioridades

| Prioridad | Significado |
|---|---|
| **Alta** | Imprescindible para el MVP. Sin esto, la app no cumple su propósito. |
| **Media** | Recomendable para el MVP. Mejora notable de la experiencia. |
| **Baja** | Deseable. Se entrega si el tiempo lo permite; si no, roadmap. |
