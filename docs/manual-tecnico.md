# Arkana Appointments

## Manual Técnico

---

**Autor:** Ángel Andrés Villorina Cambero
**Ciclo formativo:** DAW2-A
**Proyecto:** Proyecto Final de Grado
**Centro educativo:** IES Albarregas
**Lugar y fecha:** Mérida, Badajoz — Junio 2026

---

# Manual técnico

Documento de referencia para el tribunal y para futuros desarrolladores. Describe el stack, la base de datos, la estructura del código, los requisitos cubiertos y las acciones disponibles por rol.

---

## 1. Stack tecnológico

### 1.1. Frontend

| Tecnología | Versión | Uso |
|---|---|---|
| **React** | 19.x | Librería de UI con Suspense y `React.lazy` para code-splitting por ruta. |
| **TypeScript** | 5.9.x (modo estricto) | Tipado del proyecto entero. |
| **Vite** | 7.x | Bundler y servidor de desarrollo. |
| **React Router** | 7.x | Enrutado en cliente con rutas anidadas y guardas por sesión y rol. |
| **Tailwind CSS** | 4.x | Estilos utility-first. |
| **Recharts** | 3.x | Gráficas del dashboard admin y del negocio. |
| **Mapbox GL JS** | 3.x | Mapa interactivo del perfil del negocio. |
| **date-fns** | 4.x | Manipulación y formateo de fechas en español. |
| **react-qr-code** | 2.x | Generación del código QR con logo. |
| **react-hot-toast** | 2.x | Feedback inmediato de acciones. |
| **react-icons** (`bi`) | 5.x | Set de iconos Boxicons. |
| **i18next + react-i18next** | 25.x / 16.x | Infraestructura i18n; MVP en español. |
| **@radix-ui** | 1.x | Primitivos accesibles (Sheet, Dialog, Accordion, NavigationMenu). |

### 1.2. Backend (BaaS)

| Servicio | Uso |
|---|---|
| **Supabase Auth** | Registro, login, JWT, verificación de email, recuperación de contraseña. |
| **Supabase Postgres** | Base de datos relacional con tipos enum, triggers, índices y RPCs. |
| **Supabase Storage** | Buckets `avatares`, `logos`, `galeria-negocios`. |
| **Supabase Realtime** | Notificaciones en vivo en el panel del negocio y del cliente. |
| **Edge Functions** | `send-whatsapp`: notificaciones WhatsApp al crear/confirmar/cancelar/reagendar citas. |

### 1.3. Infraestructura

| Componente | Proveedor |
|---|---|
| Hosting frontend | Vercel (Hobby, CI/CD desde `main`, previews por rama) |
| Backend y BD | Supabase (Free, región EU) |
| Mapas | Mapbox (token público restringido por dominio) |
| WhatsApp | Evolution API en Railway (~5 USD/mes) |
| Dominio | `www.arkana-appointments.com` |

---

## 2. Modelo de datos

### 2.1. Diagrama lógico

```
auth.users (Supabase)
   │ 1:1
   ▼
usuarios
   │ 1:N
   ▼
negocios ──────────── citas (cliente_id → usuarios | null si invitado)
   │ 1:N
   ├── servicios
   ├── disponibilidad
   ├── disponibilidad_excepciones
   ├── disponibilidad_bloqueos
   └── negocio_fotos
```

### 2.2. Tablas principales

| Tabla | Propósito |
|---|---|
| `usuarios` | Perfil aplicativo (rol, email, teléfono, foto, `eliminado`). |
| `negocios` | Negocio publicado (slug, lat/lng, teléfono, `whatsapp_activado`). |
| `servicios` | Catálogo de servicios por negocio. |
| `disponibilidad` | Horario semanal por día. |
| `disponibilidad_excepciones` | Aperturas puntuales fuera del horario regular. |
| `disponibilidad_bloqueos` | Días específicos cerrados. |
| `negocio_fotos` | Galería del negocio. |
| `citas` | Reserva (negocio, servicio, cliente, fecha, hora, estado). |
| `notificaciones` | Notificaciones persistentes por usuario. |
| `whatsapp_log` | Registro de cada mensaje WhatsApp enviado. |

### 2.3. Tipos enum

```sql
CREATE TYPE rol_usuario   AS ENUM ('cliente', 'negocio', 'admin');
CREATE TYPE estado_cita   AS ENUM ('new', 'pending', 'confirmed', 'cancelled', 'completed');
```

### 2.4. RPCs (SECURITY DEFINER)

| Función | Descripción |
|---|---|
| `admin_create_usuario(p_email, p_password, p_nombre, p_rol, p_telefono, p_nombre_negocio)` | Crea usuario en `auth.users` + `auth.identities` + `public.usuarios` (con email ya verificado). Opcionalmente crea negocio si el rol es `negocio`. |
| `admin_delete_usuario(p_user_id)` | Borra al usuario completamente: negocios (cascade), `public.usuarios` y `auth.users` en una sola transacción. |
| `es_admin()` | Helper interno; devuelve `true` si el llamante tiene rol `admin`. |

### 2.5. Índices de rendimiento

- `idx_citas_negocio_fecha` — `(negocio_id, fecha)`
- `idx_citas_negocio_estado` — `(negocio_id, estado)`
- `idx_disponibilidad_negocio_dia` — `(negocio_id, dia_semana)`
- `uq_citas_slot` — índice único parcial `(negocio_id, fecha, hora_inicio) WHERE estado <> 'cancelled'`

---

## 3. Estructura del código (`src/`)

```
src/
├── App.tsx                     # Routing, lazy loading y error boundaries globales
├── main.tsx                    # Entry point con AuthProvider y NotificationsProvider
├── assets/                     # Logos SVG, fuentes SF Pro
├── components/
│   ├── app/                    # Componentes compartidos (Sidebar, Spinner, Modales, Mapas…)
│   ├── blocks/                 # Bloques de la landing (Navbar, Hero, Footer)
│   └── ui/                     # Primitivos UI (Sheet, Accordion, Button, ThemeToggle…)
├── contexts/
│   ├── AuthContext.tsx          # Sesión, perfil, negocio y métodos de auth
│   └── NotificationsContext.tsx # Realtime + polling de respaldo cada 10 s
├── hooks/                      # Hooks personalizados (useTheme, etc.)
├── layouts/
│   ├── AppLayout.tsx            # Panel del negocio (guarda de rol + email verificado)
│   ├── ClienteLayout.tsx        # Portal del cliente (guarda + email verificado)
│   └── AdminLayout.tsx          # Panel admin
├── lib/
│   ├── supabase.ts              # Cliente Supabase + tipos del dominio
│   ├── validators.ts            # Validaciones (email, contraseña, teléfono)
│   └── utils.ts                 # Helpers generales
└── pages/
    ├── arkana/                  # Landing pública
    ├── auth/                    # Login, registro, recuperar/nueva contraseña, verificar email
    ├── booking/                 # Página pública /n/:slug
    ├── cliente/                 # Portal del cliente (/app)
    ├── dashboard/               # Panel del negocio (/panel)
    ├── admin/                   # Panel admin (/admin)
    └── legal/                   # Privacidad, Términos, Estado, Seguridad, Sobre nosotros
```

---

## 4. Flujos de autenticación

| Flujo | Descripción |
|---|---|
| **Registro** | Email + contraseña. Supabase envía email de verificación. La app bloquea el acceso hasta que se confirme. |
| **Login** | Email + contraseña vía Supabase Auth. Redirige según rol (`/panel`, `/app`, `/admin`). |
| **Recuperación** | El usuario solicita enlace en `/recuperar-password`. Supabase envía email con token. El enlace lleva a `/nueva-password` donde introduce la nueva contraseña. |
| **Cambio de email** | Desde Configuración. Supabase envía confirmación al nuevo email antes de aplicar el cambio. |
| **Cambio de contraseña** | Desde Configuración. Requiere la contraseña actual. |
| **Admin crea usuario** | Usa RPC `admin_create_usuario`. El usuario queda con email ya verificado y puede iniciar sesión de inmediato. |

---

## 5. Acciones disponibles por rol

### 5.1. Cliente

- Reservar en cualquier negocio publicado (con o sin cuenta).
- Ver y cancelar sus citas próximas.
- Recibir notificaciones en tiempo real.
- Editar perfil (nombre, teléfono, foto).
- Cambiar email y contraseña desde Configuración.
- Cambiar tema claro / oscuro.

### 5.2. Negocio

- Editar perfil público completo (logo, galería, ubicación en mapa, servicios).
- Definir horario semanal, excepciones y bloqueos de días.
- Ver y gestionar citas en tiempo real (confirmar, completar, cancelar, reagendar).
- Crear una cita manualmente.
- Descargar código QR.
- Consultar estadísticas (hoy / semana / mes + tendencia 12 días).

### 5.3. Administrador

- Dashboard con métricas agregadas y gráfica de altas a 30 días.
- Listar, buscar, filtrar, crear, editar, desactivar/activar y eliminar usuarios.
- Crear negocio completo (usuario + perfil) desde la UI.

---

## 6. Despliegue

Ver `manual-despliegue.md` para el procedimiento paso a paso. Resumen:

1. Variables de entorno en Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_MAPBOX_TOKEN`.
2. Push a `main` → Vercel reconstruye y publica automáticamente.
3. Migraciones SQL aplicadas en el SQL Editor de Supabase.

---

## 7. Roadmap post-MVP

- Endurecer políticas RLS en todas las tablas.
- Internacionalización español + inglés.
- Vista calendario día/semana en el panel del negocio.
- Integración con Sentry, Betterstack y Umami.
- Auditoría WCAG 2.1 AA formal.
