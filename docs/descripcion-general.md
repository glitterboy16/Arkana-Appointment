# 1. Descripción general del proyecto

## 1.1. Identificación

| Campo | Valor |
|---|---|
| Nombre del proyecto | **Arkana Appointments** |
| Tipo | Aplicación web (SaaS) |
| Contexto académico | TFG — CFGS Desarrollo de Aplicaciones Web (DAW) |
| Centro | IES Albarregas — Mérida (España) |
| Autor | Angel Andrés Villorina Cambero |
| Tutor | Francisco José Mera Calderón |
| Curso | 2025 / 2026 |
| Dominio web | [www.arkana-appointments.com](https://www.arkana-appointments.com) |

## 1.2. Resumen ejecutivo

**Arkana Appointments** es una aplicación web que permite a pequeñas y medianas empresas (PYMES) digitalizar la gestión de sus citas. Cada negocio dispone de un perfil público accesible mediante un **código QR único**, desde el cual sus clientes pueden consultar la disponibilidad horaria y reservar una cita sin necesidad de registrarse ni instalar ninguna aplicación.

La solución está pensada para cubrir el problema común de las PYMES multi-rubro (barberías, peluquerías, clínicas estéticas, talleres, consultas profesionales, spas, estudios de tatuaje, etc.) que hoy gestionan sus reservas por WhatsApp manual, llamadas o cuadernos físicos, generando solapamientos, olvidos y pérdida de clientes.

## 1.3. Objetivos

### 1.3.1. Objetivo general

Diseñar, desarrollar y desplegar una aplicación web funcional que permita a una PYME gestionar la reserva de citas de forma centralizada, digital y accesible para sus clientes.

### 1.3.2. Objetivos específicos

1. Ofrecer al negocio un **panel privado** para configurar su perfil, servicios, horarios y disponibilidad.
2. Generar automáticamente un **código QR único** por negocio que enlaza con su perfil público.
3. Permitir al cliente **reservar una cita** desde el perfil público, sin registro obligatorio, en menos de un minuto.
4. Implementar un sistema de **roles** con permisos diferenciados (cliente, empresa, administrador).
5. Enviar **notificaciones automáticas por WhatsApp** al confirmar, modificar o cancelar una cita.
6. Proveer un **panel de administración global** para supervisar negocios, usuarios e incidencias de toda la plataforma.
7. Garantizar **seguridad** en el acceso y protección de los datos personales (RGPD).
8. Entregar una experiencia **responsive** funcional en móvil, tablet y escritorio.

## 1.4. Alcance del MVP

El alcance del Trabajo de Fin de Grado cubrirá la entrega de un **MVP** (producto mínimo viable) funcional y desplegado en producción, con las siguientes capacidades:

| Módulo | Incluido en MVP |
|---|:---:|
| Registro y autenticación (negocio / cliente / admin) | ✅ |
| Perfil público de negocio | ✅ |
| Generación de código QR por negocio | ✅ |
| Gestión de disponibilidad horaria | ✅ |
| Reserva de cita desde el perfil público (con o sin cuenta) | ✅ |
| Panel del negocio (gestión de citas propias, estadísticas y QR) | ✅ |
| Panel de administrador (CRUD usuarios y negocios, métricas) | ✅ |
| Notificaciones en tiempo real dentro de la app | ✅ |
| Notificaciones por WhatsApp | 🔵 Pospuesto (roadmap) |
| Diseño responsive (320 → 1920 px) | ✅ |
| Tema claro y oscuro | ✅ |
| Conformidad RGPD (privacidad, términos, cookies) | ✅ |


## 1.5. Público objetivo

### 1.5.1. Usuarios finales

| Perfil | Descripción |
|---|---|
| **Negocio / Empresa** | PYMES de servicios que atienden por cita previa. Ejemplos: barberías, peluquerías, estudios de estética, clínicas dentales, fisioterapeutas, talleres de reparación, consultoría profesional, tatuadores, spas. Perfil tipo: propietario o recepcionista sin conocimientos técnicos, uso diario desde móvil o escritorio. |
| **Cliente final** | Consumidor de los servicios del negocio. No necesita cuenta obligatoria: puede reservar como invitado introduciendo nombre, teléfono y correo. Uso principal desde móvil (tras escanear el QR). |
| **Administrador de la plataforma** | Usuario interno de Arkana con visibilidad global: supervisa negocios dados de alta, usuarios registrados, incidencias y métricas de uso agregadas. |

### 1.5.2. Rubros objetivo inicial

Arkana nace como solución **multi-rubro**, diseñada para adaptarse a cualquier negocio que funcione por cita previa. En la fase inicial se priorizan los sectores con mayor demanda y menor dependencia tecnológica:

- Barberías y peluquerías
- Estética y belleza (uñas, depilación, masajes)
- Clínicas dentales y fisioterapia
- Estudios de tatuaje y piercing
- Talleres de reparación (mecánicos, electrónica)
- Consultoría profesional (abogados, asesores, psicólogos)

## 1.6. Roles del sistema

| Rol | Permisos principales |
|---|---|
| **Cliente** | Consultar perfil público de un negocio, ver disponibilidad, reservar cita, cancelar cita propia. |
| **Empresa** | Todo lo anterior + gestionar su propio perfil, servicios, horarios, disponibilidad; aceptar/rechazar/cancelar citas de sus clientes; ver historial. |
| **Administrador** | Visibilidad global: listar negocios y usuarios, suspender cuentas, consultar métricas agregadas, gestionar incidencias. |

## 1.7. Flujo principal (caso de uso central)

1. El **negocio** se registra en Arkana y configura su perfil, servicios y disponibilidad semanal.
2. Arkana genera automáticamente su **código QR único** y una URL pública (`/negocio/:codigoQr`).
3. El negocio **imprime** el QR y lo coloca en su local (escaparate, mostrador, tarjetas).
4. Un **cliente** escanea el QR con su móvil y accede al perfil público del negocio.
5. El cliente **elige servicio y horario disponible**, y confirma la reserva introduciendo sus datos de contacto.
6. La plataforma **registra la cita** y envía una notificación por **WhatsApp** tanto al cliente como al negocio.
7. El negocio **gestiona la cita** desde su panel (confirmar, modificar, cancelar), y cada cambio dispara una nueva notificación al cliente.

## 1.8. Premisas y restricciones

### Premisas
- Los clientes disponen de un smartphone con cámara y conexión a internet.
- Los negocios tienen acceso habitual a internet desde un dispositivo (móvil u ordenador).
- Supabase cubre las necesidades iniciales de autenticación, base de datos y almacenamiento dentro del plan gratuito durante la fase de MVP.

### Restricciones
- El desarrollo debe completarse dentro del calendario del TFG (curso 2025/2026).
- La aplicación debe cumplir el **Reglamento General de Protección de Datos (RGPD)** de la UE.
- El despliegue se realizará en **Vercel** (plan gratuito) y la base de datos en **Supabase** (plan gratuito).
- La solución debe ser mantenible por una única persona a corto plazo.
