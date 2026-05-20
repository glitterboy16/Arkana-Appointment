# 🌊 Arkana Appointments — Reserva de citas con QR sin fricción

![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)

> 🌊 **Arkana Appointments** es una aplicación web SaaS que digitaliza la gestión de citas para negocios de servicios (peluquerías, clínicas, estudios, talleres). Cada negocio recibe un **QR único** que sus clientes escanean para reservar sin necesidad de registrarse, mientras el negocio gestiona toda su agenda desde un panel moderno con notificaciones WhatsApp automáticas.

---

## 🌍 Descripción general

Arkana resuelve un problema concreto: **los pequeños negocios pierden citas porque sus clientes no quieren bajar otra app más**. La solución es un flujo radicalmente simple: el cliente escanea el QR pegado en el local, ve disponibilidad real en el móvil y reserva en menos de 30 segundos. El negocio recibe la cita por WhatsApp y la gestiona desde un dashboard pensado para usarse desde el móvil del mostrador.

🔹 **Frontend:** React 19 + Vite 7 + TypeScript + TailwindCSS 4
🔹 **Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
🔹 **WhatsApp:** Evolution API v2.3.7 desplegada en Railway sobre Baileys
🔹 **Mapas:** Mapbox GL para ubicación geográfica del negocio
🔹 **Diseño:** dark-first con glassmorphism, inspirado en Linear y Raycast
🔹 **Idiomas:** español por defecto, con i18next preparado para multi-idioma
🔹 **Objetivo:** SaaS multi-negocio con panel cliente, panel negocio y panel admin

---

## 🚀 Despliegue

🌐 **Producción:** [https://www.arkana-appointments.com](https://www.arkana-appointments.com)
📦 **Repositorio:** [github.com/glitterboy16/Arkana-Appointment](https://github.com/glitterboy16/Arkana-Appointment)

El despliegue es automático: cada `push` a la rama `main` dispara un build en Vercel. Las ramas `feature/*` generan **preview deployments** independientes con URL única para revisar cambios antes del merge.

---

## 🧱 Estructura del proyecto

```
arkana-appointments/
│
├── public/                       # Logo, favicons, manifiesto PWA
│
├── docs/                         # Documentación técnica y manuales
│   ├── fases/                    # Plan de las 4 fases del desarrollo
│   ├── Manuales/                 # Manual técnico, despliegue y usuario
│   ├── 01-descripcion-general.md
│   ├── 02-requisitos-funcionales.md
│   ├── 03-requisitos-no-funcionales.md
│   ├── 04-stack-dependencias.md
│   └── 09-whatsapp-evolution.md
│
├── supabase/
│   ├── migrations/               # 013 migraciones SQL versionadas
│   └── functions/
│       └── send-whatsapp/        # Edge Function de notificaciones
│
├── src/
│   ├── pages/
│   │   ├── arkana/               # Landing pública
│   │   ├── auth/                 # Login y registro
│   │   ├── booking/              # Reserva pública vía QR
│   │   ├── cliente/              # Mis citas, perfil, buscar negocios
│   │   ├── dashboard/            # Panel del negocio (citas, perfil, QR, stats)
│   │   ├── admin/                # Panel administrador
│   │   └── legal/                # Privacidad y términos
│   ├── components/
│   │   ├── ui/                   # shadcn/ui sobre Radix
│   │   ├── blocks/               # Navbar, hero, dashboard 3D
│   │   └── app/                  # Modales, sidebars, mapa, uploaders
│   ├── layouts/                  # AppLayout, ClienteLayout, AdminLayout
│   ├── contexts/                 # AuthContext, NotificationsContext
│   ├── hooks/                    # useTheme
│   ├── lib/                      # supabase, database.types, errorLogger, geocode
│   ├── App.tsx                   # Enrutamiento principal con React Router
│   ├── main.tsx                  # Entrada de la app
│   └── index.css                 # Estilos globales Tailwind
│
├── .env.example                  # Plantilla de variables (NO commitear .env)
├── vercel.json                   # Config de cabeceras de seguridad + CSP
├── package.json
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## ⚙️ Instalación y ejecución local

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/glitterboy16/Arkana-Appointment.git
cd Arkana-Appointment
```

### 2️⃣ Instalar dependencias

```bash
npm install
```

### 3️⃣ Configurar variables de entorno

Copia `.env.example` a `.env.local` y rellena:

```env
VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
VITE_SUPABASE_ANON_KEY="tu-anon-key-publica"
VITE_MAPBOX_TOKEN="pk.tu-token-publico-de-mapbox"
```

### 4️⃣ Ejecutar el entorno de desarrollo

```bash
npm run dev
```

El proyecto se abrirá en: **http://localhost:5173**

---

## 🗄️ Base de datos (Supabase)

### Tablas principales

| Tabla | Filas* | Descripción |
|---|---|---|
| `usuarios` | 8 | Perfiles de usuarios registrados (cliente / negocio / admin) vinculados a `auth.users` |
| `negocios` | 3 | Negocios con nombre, dirección, teléfono, logo, ubicación geográfica y opt-in WhatsApp |
| `servicios` | 3 | Servicios ofrecidos por cada negocio (nombre, duración, precio) |
| `disponibilidad` | 7 | Horarios semanales del negocio por día de la semana |
| `disponibilidad_excepciones` | 4 | Días no laborables o con horario especial |
| `disponibilidad_bloques_excluidos` | 0 | Franjas concretas bloqueadas dentro de un día |
| `citas` | 18 | Reservas con cliente (registrado o anónimo), servicio, fecha y estado |
| `negocio_fotos` | 2 | Galería de imágenes del negocio (Supabase Storage) |
| `whatsapp_log` | 9 | Registro de cada notificación WhatsApp enviada (estado, error, message_id) |
| `error_logs` | 4 | Errores de cliente capturados por el ErrorBoundary global |

*Filas a fecha de la última instantánea. Las cifras crecen con el uso real.*

### Storage Buckets

| Bucket | Uso |
|---|---|
| `avatars` | Avatar del usuario |
| `negocio-logos` | Logo del negocio |
| `negocio-fotos` | Galería pública del negocio |

### Migraciones

Las migraciones están versionadas en [`supabase/migrations/`](supabase/migrations/) y se aplican secuencialmente. Hitos relevantes:

- `002` — Perfil de cliente
- `005` — Horarios, excepciones y galería
- `006` — Realtime sobre tabla `citas`
- `007` — Ubicación geográfica del negocio
- `008` — Panel admin
- `010` — Buckets de imágenes
- `011` — Índices de rendimiento + estado `completed`
- `013` — Notificaciones WhatsApp (tabla `whatsapp_log`, opt-in, trigger de reagendado)

---

## 👤 Roles de usuario

| Rol | Permisos |
|---|---|
| 👀 **Visitante** | Acceso a la landing, páginas legales y reserva pública vía QR (sin registro) |
| 🙋 **Cliente registrado** | Historial completo de citas, opt-in WhatsApp, perfil, buscar negocios cercanos |
| 💼 **Negocio** | Panel completo: agenda en tiempo real, configuración de servicios y horarios, estadísticas, QR generador, mapa, galería |
| 🛡️ **Admin** | Gestión global de usuarios y negocios, soft-delete, métricas de la plataforma |

---

## 🧠 Tecnologías principales

| Tecnología | Uso |
|---|---|
| ⚛️ **React 19 + Vite 7** | Frontend moderno con HMR ultrarrápido |
| 🔷 **TypeScript 5.9** | Tipado estricto end-to-end con tipos generados desde Supabase |
| 🎨 **TailwindCSS 4** | Estilos atómicos, modo oscuro, glassmorphism |
| 🧩 **shadcn/ui + Radix** | Componentes accesibles (Accordion, Dialog, NavigationMenu, Sheet) |
| 🧰 **Supabase** | PostgreSQL + Auth + Storage + Realtime + Edge Functions |
| 💬 **Evolution API** | WhatsApp Business sobre Baileys, desplegada en Railway |
| 🗺️ **Mapbox GL** | Mapa interactivo del negocio + selector de ubicación |
| 📅 **date-fns** | Manipulación de fechas con zonas horarias |
| 🐻 **Zustand** | Estado global ligero |
| 📝 **React Hook Form + Zod** | Formularios con validación tipada |
| 📊 **Recharts** | Gráficas en el dashboard de estadísticas |
| 🎬 **GSAP** | Animaciones de la landing |
| 🔔 **react-hot-toast + SweetAlert2** | Notificaciones y diálogos modales |
| 🌐 **i18next** | Sistema preparado para internacionalización |
| 📷 **react-qr-code** | Generación del QR único por negocio |

---

## 💻 Comandos útiles

| Acción | Comando |
|---|---|
| Instalar dependencias | `npm install` |
| Ejecutar en desarrollo | `npm run dev` |
| Build de producción | `npm run build` |
| Previsualizar build | `npm run preview` |
| Linter | `npm run lint` |

---

## 🧩 Características implementadas

### 🌐 Landing y reserva pública
- ✅ Landing oscura con hero animado y dashboard 3D
- ✅ Página de reserva pública sin registro (acceso vía QR del negocio)
- ✅ Selección de servicio, fecha y hora con disponibilidad en tiempo real
- ✅ Modo oscuro / claro con toggle persistente
- ✅ Páginas legales (Privacidad, Términos) y banner de cookies

### 🙋 Panel del cliente
- ✅ Login y registro con Supabase Auth (email/password)
- ✅ Mis citas: histórico con filtros por estado
- ✅ Reagendar y cancelar cita desde la propia tarjeta
- ✅ Búsqueda de negocios por geolocalización con Mapbox
- ✅ Notificaciones campana con estado leído/no leído
- ✅ Configuración del perfil + opt-in WhatsApp

### 💼 Panel del negocio
- ✅ Dashboard con métricas (citas hoy, semana, mes)
- ✅ Calendario de citas con vista día / semana / mes
- ✅ Modal de nueva cita manual desde el dashboard
- ✅ Modal de reagendar con validación de disponibilidad
- ✅ Gestión de servicios (CRUD)
- ✅ Configuración de horarios semanales por día
- ✅ Excepciones (vacaciones, festivos, días especiales)
- ✅ Bloqueo de franjas horarias puntuales
- ✅ Perfil del negocio: nombre, descripción, dirección, teléfono, logo
- ✅ Mapa interactivo con selector de coordenadas (drag & drop)
- ✅ Galería de fotos con uploader directo a Supabase Storage
- ✅ Generador y descarga del QR del negocio (PNG y PDF)
- ✅ Estadísticas con gráficas de citas, ingresos y servicios más demandados

### 🛡️ Panel admin
- ✅ Lista de todos los usuarios y negocios
- ✅ Soft-delete con confirmación
- ✅ Métricas globales de la plataforma

### 💬 Notificaciones WhatsApp (automáticas)
- ✅ Nueva cita → notifica al negocio
- ✅ Cita confirmada → notifica al cliente
- ✅ Cita cancelada → notifica al cliente
- ✅ Cita reagendada → notifica al cliente con fecha anterior y nueva
- ✅ Opt-in fino por negocio y por cliente
- ✅ Registro completo en `whatsapp_log` con `message_id` de Evolution
- ✅ Latencia medida: ~1 segundo desde el cambio en BBDD hasta WhatsApp entregado

### 🔒 Seguridad y robustez
- ✅ Cabeceras de seguridad estrictas vía `vercel.json` (CSP, HSTS, X-Frame-Options, Permissions-Policy)
- ✅ Service worker desactivado para evitar caché agresivo en updates
- ✅ ErrorBoundary global con persistencia en BBDD (`error_logs`)
- ✅ Validación tipada de formularios con Zod
- ✅ Tipos de BBDD generados desde Supabase (`database.types.ts`)

---

## 🗺️ Mapa de vistas

| Vista | Ruta | Descripción |
|---|---|---|
| 🏠 Inicio | `/` | Landing pública con hero y CTA |
| 🔐 Auth | `/auth` | Login y registro |
| 📱 Reserva pública | `/r/:negocioId` | Flujo de reserva vía QR sin login |
| 📅 Mis citas | `/cliente/mis-citas` | Histórico del cliente registrado |
| 👤 Perfil cliente | `/cliente/perfil` | Datos personales y opt-in |
| 🔎 Buscar negocios | `/cliente/buscar` | Mapa con negocios cercanos |
| 🔔 Notificaciones | `/cliente/notificaciones` | Centro de notificaciones |
| 📊 Panel negocio | `/dashboard` | Resumen y métricas |
| 🗓️ Citas | `/dashboard/citas` | Agenda completa del negocio |
| 🏪 Perfil del negocio | `/dashboard/perfil` | Edición de datos públicos |
| ⚙️ Configuración | `/dashboard/configuracion` | Servicios, horarios, excepciones |
| 📈 Estadísticas | `/dashboard/estadisticas` | Gráficas Recharts |
| 🟪 QR | `/dashboard/qr` | Descarga del QR único |
| 🛡️ Admin | `/admin` | Panel de administración |
| 📜 Legal | `/legal/privacidad`, `/legal/terminos` | Páginas legales |

---

## 💬 Integración WhatsApp con Evolution API

Una de las piezas más diferenciadoras de Arkana: **notificaciones WhatsApp automáticas** sin pasar por la API oficial de Meta (que requiere verificación empresarial). El flujo completo es:

```
┌──────────┐    ┌──────────────────┐    ┌──────────────────┐    ┌─────────────┐
│  citas   │───▶│ Database Webhook │───▶│ Edge Function    │───▶│ Evolution   │
│  table   │    │ (INSERT/UPDATE)  │    │ send-whatsapp    │    │ API Railway │
└──────────┘    └──────────────────┘    └──────────────────┘    └─────────────┘
                                                │
                                                ▼
                                        ┌──────────────────┐
                                        │  whatsapp_log    │
                                        │  (estado, msgId) │
                                        └──────────────────┘
```

**Stack Railway:** `evoapicloud/evolution-api:v2.3.7` + Postgres + Redis + volumen persistente.
**Número conectado:** `+34 632 956 059` con perfil "Arkana Appointments".
**Detalles completos:** ver [`docs/09-whatsapp-evolution.md`](docs/09-whatsapp-evolution.md).

---

## 📅 Hitos del desarrollo

El proyecto se ha desarrollado en **4 fases secuenciales**, cada una con objetivo, entregables y verificación documentados en [`docs/fases/`](docs/fases/):

| Fase | Objetivo | Estado |
|---|---|---|
| **1️⃣ Cimientos** | Stack, autenticación Supabase, RLS, layout base, modo oscuro | ✅ Completada |
| **2️⃣ Reservas** | Reserva pública vía QR, calendario, gestión de servicios y horarios | ✅ Completada |
| **3️⃣ Paneles** | Panel del negocio, panel del cliente, panel admin, estadísticas | ✅ Completada |
| **4️⃣ Producción** | Cabeceras de seguridad, error logging, performance, WhatsApp Evolution | ✅ Completada |

Cada fase tiene su documento dedicado en [`docs/05-fase-1-cimientos.md`](docs/05-fase-1-cimientos.md) hasta [`docs/08-fase-4-produccion.md`](docs/08-fase-4-produccion.md), con requisitos funcionales, requisitos no funcionales y criterios de aceptación.

---

## 📚 Documentación

La carpeta [`docs/`](docs/) contiene la documentación completa del proyecto:

| Documento | Contenido |
|---|---|
| 📘 [Manual técnico](docs/manual-tecnico.md) | Arquitectura, modelado de datos, decisiones de diseño |
| 🚀 [Manual de despliegue](docs/manual-despliegue.md) | Deploy paso a paso en Vercel + Supabase + Railway |
| 🙋 [Manual de usuario](docs/manual-usuario.md) | Guía funcional para clientes, negocios y administradores |
| 📋 [Descripción general](docs/01-descripcion-general.md) | Visión, propósito y alcance del producto |
| ✅ [Requisitos funcionales](docs/02-requisitos-funcionales.md) | RFs numerados con criterios de aceptación |
| 🛡️ [Requisitos no funcionales](docs/03-requisitos-no-funcionales.md) | Seguridad, rendimiento, accesibilidad |
| 🧩 [Stack y dependencias](docs/04-stack-dependencias.md) | Justificación de cada librería |
| 💬 [WhatsApp Evolution](docs/09-whatsapp-evolution.md) | Receta exacta del deploy en Railway |

---

## 👨‍💻 Autoría

**Ángel Villorina Andrés**
Proyecto Arkana Appointments — 2026

📧 villorinaangelandres@gmail.com
🔗 [github.com/glitterboy16](https://github.com/glitterboy16)

---

## 🏷️ Licencia

Distribuido bajo licencia **MIT**. Consulta el archivo `LICENSE` para más información.

---

> 💜 *Reservar una cita no debería ser más complicado que escanear un código.*
