# 4. Stack tecnológico y dependencias

## 4.1. Visión general

Arkana Appointments se construye sobre un stack **moderno, tipado y gratuito en su plan inicial**, orientado a minimizar coste de infraestructura y maximizar productividad del desarrollador único.

```
┌─────────────────────────────────────────────────────────┐
│               Frontend (Vercel)                         │
│  React 19 + TypeScript + Vite + Tailwind CSS v4         │
│  Router · Estado · i18n · UI · Animaciones · Charts     │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTPS / REST
                            ▼
┌─────────────────────────────────────────────────────────┐
│               Supabase (EU region)                      │
│   Auth (JWT) · PostgreSQL · Storage · RLS · Realtime    │
└───────────────────────────┬─────────────────────────────┘
                            │ API WhatsApp Business
                            ▼
┌─────────────────────────────────────────────────────────┐
│            Servicio de notificaciones                   │
│       (Meta WhatsApp Cloud API o proveedor)             │
└─────────────────────────────────────────────────────────┘
```

## 4.2. Frontend — dependencias de producción

| Paquete | Versión | Uso | Justificación |
|---|---|---|---|
| `react` | 19.x | Librería principal de UI | Estándar de facto para SPA modernas, hooks, Suspense, concurrent mode. |
| `react-dom` | 19.x | Renderizado en el navegador | Imprescindible junto a React. |
| `react-router-dom` | 7.x | Enrutado en cliente | Rutas anidadas, loaders y protección por guardas. |
| `@supabase/supabase-js` | 2.x | Cliente oficial de Supabase | Auth, queries a Postgres, storage y realtime desde un único SDK tipado. |
| `zustand` | 5.x | Gestión de estado global | Alternativa ligera a Redux. API mínima, zero boilerplate. |
| `i18next` + `react-i18next` | 25.x / 16.x | Internacionalización | Solución madura y compatible con SSR. Permite JSON por idioma. |
| `i18next-browser-languagedetector` | 8.x | Detección automática de idioma | Aplica el idioma del navegador como valor por defecto. |
| `tailwindcss` + `@tailwindcss/vite` | 4.x | Sistema de estilos utility-first | Diseño rápido, consistencia visual, sin CSS manual. |
| `lucide-react` | 0.5x | Librería de iconos | SVG optimizados, tree-shakeable, ligeros. |
| `sweetalert2` | 11.x | Modales y alertas | Sustituye `alert()` nativo con diseño profesional. |
| `react-hot-toast` | 2.x | Notificaciones toast | Feedback inmediato de acciones sin bloquear UI. |
| `gsap` | 3.x | Animaciones avanzadas | Transiciones y microinteracciones en la landing y QR. |
| `recharts` | 3.x | Gráficas del panel admin | Métricas agregadas (citas/día, negocios nuevos). |

## 4.3. Frontend — dependencias de desarrollo

| Paquete | Versión | Uso |
|---|---|---|
| `typescript` | 5.9.x | Compilador del lenguaje |
| `typescript-eslint` | 8.x | Reglas de ESLint específicas para TS |
| `eslint` | 9.x | Linter principal |
| `eslint-plugin-react-hooks` | 7.x | Validación de las reglas de hooks |
| `eslint-plugin-react-refresh` | 0.4.x | Validación de exports con HMR |
| `@vitejs/plugin-react` | 5.x | Integración React–Vite con Fast Refresh |
| `vite` | 7.x | Bundler y servidor de desarrollo |
| `autoprefixer` + `postcss` | 10.x / 8.x | Pipeline CSS (requerido por Tailwind v4) |
| `@types/node`, `@types/react`, `@types/react-dom`, `@types/react-router-dom` | — | Tipos oficiales |
| `globals` | 16.x | Variables globales del entorno para ESLint |

## 4.4. Backend

El backend se implementa íntegramente sobre **Supabase**, que actúa como BaaS (Backend-as-a-Service).

| Servicio | Uso |
|---|---|
| **Supabase Auth** | Registro, login, JWT, recuperación de contraseña, proveedores OAuth (futuro). |
| **Supabase Postgres** | Base de datos relacional con soporte nativo para JSON, triggers y funciones PL/pgSQL. |
| **Row Level Security (RLS)** | Autorización granular a nivel de fila según el rol del usuario. |
| **Supabase Storage** | Almacenamiento de logotipos de negocio y avatares de usuario. |
| **Supabase Realtime** | Futuro: actualizaciones en vivo del panel del negocio cuando entra una reserva nueva. |
| **Edge Functions** | Futuro: envío de notificaciones WhatsApp tras trigger de inserción en `citas`. |

### Razones para elegir Supabase

- Plan gratuito suficiente para el MVP (2 proyectos, 500 MB DB, 1 GB Storage, 50 000 MAU).
- SDK oficial TypeScript con tipado autogenerado.
- RLS declarativo que evita escribir una API intermedia.
- Región EU disponible (cumplimiento RGPD).
- Alternativa open-source: se puede autoalojar si el negocio escala.

## 4.5. Integraciones externas

| Servicio | Uso | Estado MVP | Fase |
|---|---|---|---|
| **Meta WhatsApp Cloud API** | Envío de notificaciones transaccionales al cliente y negocio. | Previsto en MVP | 3 |
| **Vercel** | CI/CD, hosting y previews por PR. | Activo | 1 |
| **GitHub** | Control de versiones y colaboración. | Activo | 1 |
| **Sentry** | Monitoreo de errores JS en cliente. DSN vía `VITE_SENTRY_DSN`. | Previsto en MVP | 1 |
| **Betterstack** | Uptime monitoring de la URL de producción. Sin paquete npm, configurado desde el dashboard. | Post-MVP / Fase 4 | 4 |
| **Umami Analytics** | Analíticas web sin cookies, cumple RGPD. Script externo en `index.html`. | Post-MVP / Fase 4 | 3–4 |

### Sentry — configuración

```bash
npm install @sentry/react
```

Variables de entorno necesarias:

```
VITE_SENTRY_DSN=https://xxx@oXXX.ingest.sentry.io/XXX
```

Inicialización en `src/main.tsx` — ver `08-fase-4-produccion.md` para el snippet completo.

### Betterstack — configuración

No requiere instalación npm. Pasos:
1. Crear cuenta en [betterstack.com](https://betterstack.com)
2. Nuevo monitor → URL `https://www.arkanaappointments.com`
3. Intervalo: 1 min · Notificación por email al caer
4. Configurar status page (opcional, fase post-MVP)

### Umami Analytics — configuración

No requiere npm. Pasos:
1. Crear cuenta en [umami.is](https://umami.is) o autoalojar
2. Añadir sitio → obtener `WEBSITE_ID`
3. Insertar script en `index.html` (ver `08-fase-4-produccion.md`)

## 4.6. Infraestructura y despliegue

| Componente | Proveedor | Plan inicial |
|---|---|---|
| Frontend | Vercel | Hobby (gratuito) |
| Backend / BD | Supabase | Free tier (EU) |
| Dominio | `www.arkanaappointments.com` | Gestionado externamente |
| CI/CD | Vercel + GitHub Actions (futuro) | — |

## 4.7. Herramientas de desarrollo

| Herramienta | Uso |
|---|---|
| **Node.js 20+** | Runtime y gestor de paquetes (`npm`) |
| **Git** | Control de versiones |
| **GitHub** | Hospedaje del repositorio |
| **Antigravity** | IDE principal |
| **Notion** | Documentación viva del proyecto |

## 4.8. Versiones mínimas recomendadas

```
node     >= 20.10.0
npm      >= 10.0.0
git      >= 2.40.0
```

## 4.9. Estructura de carpetas del proyecto

```
arkana-appointments/
├── docs/                      # Documentación funcional del TFG
├── public/                    # Recursos estáticos
├── src/
│   ├── @types/                # Declaraciones de tipos
│   ├── backend/               # Modelos de dominio y rutas (preparado)
│   ├── components/            # Componentes UI reutilizables
│   │   ├── admin/
│   │   ├── citas/
│   │   ├── footer/, form/, home/, modal/, navbar/
│   ├── database/              # Capa de datos
│   │   ├── data/              # Datos mock iniciales
│   │   ├── repositories/      # Contratos de repositorio
│   │   └── supabase/          # Implementación Supabase
│   ├── interfaces/            # Tipos del dominio (Cita, Negocio, Usuario…)
│   ├── layouts/               # Layouts reutilizables
│   ├── locales/               # Traducciones i18n
│   ├── pages/
│   │   ├── arkana/            # Páginas específicas de Arkana
│   │   └── (globales: login, registro, perfil…)
│   ├── router/                # Rutas protegidas (guardas)
│   ├── store/                 # Stores Zustand
│   ├── types/                 # Tipos auxiliares
│   ├── utils/                 # Helpers (regex, i18n helpers…)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env                       # Variables locales (no versionadas)
├── .env.example               # Plantilla de variables
├── .gitignore
├── CLAUDE.md                  # Instrucciones del asistente IA
├── README.md
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig*.json
├── vercel.json
└── vite.config.ts
```
