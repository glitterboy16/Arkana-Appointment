# Stack tecnológico y dependencias

## Visión general

Arkana Appointments se construye sobre un stack **moderno, tipado y gratuito en su plan inicial**, orientado a minimizar coste de infraestructura y maximizar productividad.

```
┌──────────────────────────────────────────────────────────┐
│                  Frontend (Vercel)                       │
│   React 19 + TypeScript + Vite + Tailwind CSS v4         │
│   Router · UI · Iconos · Mapas · QR · Notificaciones     │
└──────────────────────┬───────────────────────────────────┘
                       │ HTTPS / REST
                       ▼
┌──────────────────────────────────────────────────────────┐
│                  Supabase (EU)                           │
│  Auth · PostgreSQL · Storage · RLS · Realtime · Webhooks │
└──────────────────────┬───────────────────────────────────┘
                       │ Webhook → Edge Function
                       ▼
┌──────────────────────────────────────────────────────────┐
│          Notificaciones WhatsApp (Railway)               │
│               Evolution API (Baileys)                    │
└──────────────────────────────────────────────────────────┘
```

---

## Frontend — dependencias de producción

| Paquete | Versión | Uso |
|---|---|---|
| `react` + `react-dom` | 19.x | Librería principal de UI. |
| `react-router-dom` | 7.x | Enrutado en cliente con guardas por rol. |
| `@supabase/supabase-js` | 2.x | Auth, queries Postgres, storage y realtime. |
| `tailwindcss` + `@tailwindcss/vite` | 4.x | Estilos utility-first. |
| `react-icons` (set `bi`) | 5.x | Iconos SVG Boxicons, tree-shakeable. |
| `lucide-react` | 0.5x | Iconos complementarios en componentes Radix. |
| `recharts` | 3.x | Gráficas del dashboard (admin y negocio). |
| `mapbox-gl` | 3.x | Mapa interactivo del perfil del negocio. |
| `date-fns` | 4.x | Formateo y cálculo de fechas en español. |
| `react-hot-toast` | 2.x | Feedback inmediato de acciones sin bloquear UI. |
| `react-qr-code` | 2.x | Generación del código QR con logo. |
| `i18next` + `react-i18next` + `i18next-browser-languagedetector` | 25.x / 16.x / 8.x | Infraestructura i18n lista; MVP entregado en español. |
| `@radix-ui/react-accordion`, `react-dialog`, `react-navigation-menu`, `react-slot`, `react-icons` | 1.x | Primitivos accesibles para accordion, sheet, modales y nav. |
| `class-variance-authority` + `clsx` + `tailwind-merge` | — | Helpers para variantes de clases y merge de Tailwind. |

## Frontend — dependencias de desarrollo

| Paquete | Versión | Uso |
|---|---|---|
| `typescript` | 5.9.x | Compilador (modo estricto). |
| `vite` | 7.x | Bundler y servidor de desarrollo con HMR. |
| `@vitejs/plugin-react` | 5.x | Integración React–Vite con Fast Refresh. |
| `eslint` + `typescript-eslint` | 9.x / 8.x | Linter con reglas TS. |
| `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh` | — | Validación de reglas de hooks y exports con HMR. |
| `autoprefixer` + `postcss` | — | Pipeline CSS requerido por Tailwind v4. |
| `@types/node`, `@types/react`, `@types/react-dom`, `@types/mapbox-gl` | — | Tipos de TypeScript. |
| `globals` | 16.x | Variables globales del entorno para ESLint. |

---

## Backend (BaaS — Supabase)

| Servicio | Uso |
|---|---|
| **Supabase Auth** | Registro, login, JWT, recuperación de contraseña por email, verificación de email. |
| **Supabase Postgres** | Base de datos relacional: triggers, funciones PL/pgSQL, RPCs con `SECURITY DEFINER`. |
| **Row Level Security** | Autorización granular por fila según rol del usuario. |
| **Supabase Storage** | Buckets `avatares`, `logos` y `galeria-negocios`. |
| **Supabase Realtime** | Notificaciones en vivo: nuevas citas en el panel del negocio y del cliente. |
| **Edge Functions** | `send-whatsapp`: dispara notificaciones WhatsApp vía webhook de base de datos. |
| **Database Webhooks** | Dispara `send-whatsapp` en cada INSERT/UPDATE de `citas`. |

---

## Integraciones externas

| Servicio | Uso | Estado |
|---|---|---|
| **Vercel** | CI/CD, hosting y previews por rama. | ✅ Activo |
| **Mapbox** | Mapas interactivos (token público restringido por dominio). | ✅ Activo |
| **Evolution API** (Railway) | Notificaciones WhatsApp vía Baileys. Puente hasta tener API oficial Meta. | ✅ Activo |
| **Sentry** | Captura de errores JS en cliente. | 🔵 Próximamente |
| **Betterstack** | Uptime monitoring (sin npm, solo dashboard). | 🔵 Próximamente |
| **Umami Analytics** | Analíticas web sin cookies, cumple RGPD (script en `index.html`). | 🔵 Próximamente |

---

## Infraestructura y despliegue

| Componente | Proveedor | Plan |
|---|---|---|
| Frontend | Vercel | Hobby (gratuito) |
| Backend / BD | Supabase | Free tier (EU) |
| WhatsApp | Railway | ~5 USD/mes |
| Dominio | `www.arkana-appointments.com` | Gestionado externamente |

---

## Herramientas de desarrollo

| Herramienta | Uso |
|---|---|
| Node.js 20+ | Runtime y gestor de paquetes (`npm`) |
| Git + GitHub | Control de versiones y hospedaje del repositorio |
| VSCode | IDE principal |

## Versiones mínimas

```
node  >= 20.10.0
npm   >= 10.0.0
git   >= 2.40.0
```

---

## Estructura del proyecto (`src/`)

```
src/
├── App.tsx                    # Routing, lazy loading y error boundaries
├── main.tsx                   # Entry point con AuthProvider y NotificationsProvider
├── assets/                    # Logos SVG y fuentes SF Pro
├── components/
│   ├── app/                   # Componentes compartidos (Sidebar, Spinner, Modales, Mapas…)
│   ├── blocks/                # Bloques de la landing (Navbar, Hero, Footer)
│   └── ui/                    # Primitivos UI (Sheet, Accordion, Button, ThemeToggle…)
├── contexts/
│   ├── AuthContext.tsx         # Sesión, perfil, negocio y métodos de auth
│   └── NotificationsContext.tsx # Realtime + polling de respaldo cada 10 s
├── hooks/                     # Hooks personalizados (useTheme, etc.)
├── layouts/
│   ├── AppLayout.tsx           # Panel del negocio (guarda de rol + email verificado)
│   ├── ClienteLayout.tsx       # Portal del cliente (guarda + email verificado)
│   └── AdminLayout.tsx         # Panel admin
├── lib/
│   ├── supabase.ts             # Cliente Supabase + tipos del dominio
│   ├── validators.ts           # Validaciones (email, contraseña, teléfono)
│   ├── errorLogger.ts          # Helper logError()
│   └── utils.ts                # Helpers generales
└── pages/
    ├── arkana/                 # Landing pública
    ├── auth/                   # Login, registro, recuperar contraseña, nueva contraseña
    ├── booking/                # Página pública /n/:slug (reserva sin cuenta)
    ├── cliente/                # Portal del cliente (/app)
    ├── dashboard/              # Panel del negocio (/panel)
    ├── admin/                  # Panel admin (/admin)
    └── legal/                  # Privacidad, Términos, Estado, Seguridad, Sobre nosotros
```
