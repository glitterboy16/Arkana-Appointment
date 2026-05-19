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
| **Tailwind CSS** | 4.x | Estilos utility-first complementarios al CSS personalizado. |
| **Zustand** | 5.x | Estado global ligero (cuando aplica). |
| **Recharts** | 3.x | Gráficas del dashboard del admin. |
| **Mapbox GL JS** | 3.x | Mapa interactivo del perfil del negocio. |
| **date-fns** | 4.x | Manipulación y formateo de fechas en español. |
| **qrcode.react** | 4.x | Generación del código QR con logo. |
| **react-hot-toast** | 2.x | Feedback inmediato de acciones. |
| **react-icons** (`bi`) | 5.x | Set de iconos Boxicons. |

### 1.2. Backend (BaaS)

| Servicio | Uso |
|---|---|
| **Supabase Auth** | Registro, login, JWT, gestión de sesiones. |
| **Supabase Postgres** | Base de datos relacional con tipos enum, triggers y RPC. |
| **Supabase Storage** | Buckets `avatares`, `logos`, `galeria-negocios` para imágenes. |
| **Supabase Realtime** | Notificaciones en vivo en el panel del negocio y del cliente. |

### 1.3. Infraestructura

| Componente | Proveedor |
|---|---|
| Hosting frontend | Vercel (Hobby, despliegue desde `main`, previews por rama) |
| Backend y BD | Supabase (plan gratuito, región EU) |
| Mapas | Mapbox (token público restringido por dominio) |
| Dominio | `www.arkana-appointments.com` |

---

## 2. Modelo de datos

### 2.1. Diagrama lógico (resumen)

```
auth.users (Supabase)
   │
   │ 1 ──── 1
   ▼
usuarios ────────────┐
   │ id, rol, eliminado, …
   │ 1
   │
   │ 0..N
   ▼
negocios ───────── citas (cliente_id → usuarios | null si invitado)
   │ id, slug, lat, lng, …
   │ 1
   │
   │ 0..N
   ├── servicios
   ├── disponibilidad
   ├── disponibilidad_excepciones
   ├── disponibilidad_bloqueos
   ├── negocio_fotos
   └── citas (negocio_id)
```

### 2.2. Tablas principales

| Tabla | Propósito | Claves foráneas relevantes |
|---|---|---|
| `usuarios` | Perfil aplicativo (rol, email, teléfono, foto). | `id` → `auth.users(id)` |
| `negocios` | Negocio publicado. | `usuario_id` → `usuarios(id)` |
| `servicios` | Catálogo de cada negocio. | `negocio_id` → `negocios(id)` ON DELETE CASCADE |
| `disponibilidad` | Horario semanal por día. | `negocio_id` → `negocios(id)` ON DELETE CASCADE |
| `disponibilidad_excepciones` | Aperturas puntuales fuera del horario. | `negocio_id` ON DELETE CASCADE |
| `disponibilidad_bloqueos` | Días específicos cerrados. | `negocio_id` ON DELETE CASCADE |
| `negocio_fotos` | Galería del negocio. | `negocio_id` ON DELETE CASCADE |
| `citas` | Reserva. | `negocio_id`, `servicio_id`, `cliente_id` |
| `error_logs` | Registro de incidencias técnicas. | `usuario_id` (nullable) |

### 2.3. Tipos enum

```sql
create type rol_usuario as enum ('cliente', 'negocio', 'admin');
create type estado_cita as enum ('new', 'pending', 'confirmed', 'cancelled', 'completed');
```

### 2.4. RPCs

| Función | Privilegio | Descripción |
|---|---|---|
| `admin_delete_usuario(p_user_id uuid)` | `security definer` | Verifica que el llamante sea admin y borra el usuario por completo: `negocios` (cascade), `public.usuarios` y `auth.users` en una sola transacción. |

### 2.5. Índices de rendimiento

- `idx_citas_negocio_fecha` (`negocio_id`, `fecha`)
- `idx_citas_negocio_estado` (`negocio_id`, `estado`)
- `idx_disponibilidad_negocio_dia` (`negocio_id`, `dia_semana`)

---

## 3. Estructura del código (`src/`)

```
src/
├── App.tsx                    # Routing, lazy loading y error boundaries globales
├── main.tsx                   # Entry point con AuthProvider + NotificationsProvider
├── assets/                    # Logos SVG, fuentes
├── components/
│   ├── app/                   # Componentes compartidos (Btn, Avatar, Spinner, MapPicker, MapViewer,
│   │                          # ErrorBoundary, CookieBanner, Modales, NuevaCitaModal…)
│   ├── blocks/                # Bloques de la landing (navbar, hero, footer)
│   └── ui/                    # Componentes UI utilitarios
├── contexts/
│   ├── AuthContext.tsx        # Sesión, usuario, negocio, signIn/signUp/signOut
│   └── NotificationsContext   # Realtime + polling de respaldo
├── hooks/                     # Hooks personalizados (useTheme, etc.)
├── layouts/
│   ├── AppLayout.tsx          # Layout del panel del negocio (con guarda de rol)
│   ├── ClienteLayout.tsx      # Layout del portal del cliente
│   └── AdminLayout.tsx        # Layout del panel admin
├── lib/
│   ├── supabase.ts            # Cliente Supabase + tipos del dominio
│   └── errorLogger.ts         # Helper logError(contexto, err, detalle?)
└── pages/
    ├── arkana/                # Landing pública
    ├── auth/                  # Login y registro
    ├── booking/               # Página pública /n/:slug
    ├── cliente/               # Portal del cliente
    ├── dashboard/             # Panel del negocio
    ├── admin/                 # Panel del admin
    └── legal/                 # /privacidad, /terminos
```

---

## 4. Requisitos cubiertos

### 4.1. Funcionales (resumen)

| Módulo | Cubiertos | Pospuestos |
|---|---|---|
| Auth | RF-01, 02, 03, 04, 07, 09 (parcial RF-08) | RF-05, RF-06 (recuperación por correo) |
| Perfil negocio | RF-10, 11, 12, 13, 15 (parcial RF-14) | — |
| Disponibilidad | RF-16, 18, 19, 20 (parcial RF-17) | — |
| Reservas | RF-21, 22, 23, 24, 26, 27 | RF-25 (WhatsApp) |
| Panel negocio | RF-28, 29, 30, 31 | RF-32 (WhatsApp), RF-33 (vista calendario) |
| Admin | RF-34, 35, 36, 37, 38 | — |
| Notificaciones | RF-39, 40, 41 (vía Realtime interno) | RF-42 (plantillas WhatsApp) |
| Legal | RF-46, 47, 48, 49 | — |
| i18n | — | RF-43, 44, 45 |

### 4.2. No funcionales (resumen)

- **Rendimiento (RNF-01 a RNF-05)**: lazy loading, índices, gzip ≈ 148 KB inicial.
- **Seguridad (RNF-06 a RNF-15)**: HTTPS, HSTS, CSP completo, contraseñas en bcrypt, secretos fuera del repo, error boundaries con log.
- **Usabilidad (RNF-16 a RNF-21)**: responsive 320 → 1920 px, tema claro/oscuro, mensajes de error traducidos.
- **Disponibilidad (RNF-22 a RNF-24)**: 99 % heredado de Vercel + Supabase, backups diarios automáticos.
- **Mantenibilidad (RNF-25 a RNF-30)**: TypeScript estricto, layered code, ramas `feature/*` con merge `--no-ff`.
- **Despliegue (RNF-37 a RNF-40)**: CI/CD desde `main`, preview por rama.
- **Legal (RNF-41 a RNF-43)**: política, términos, banner cookies, derecho al olvido.

---

## 5. Acciones disponibles por rol

### 5.1. Cliente

- Reservar una cita en cualquier negocio publicado, con o sin cuenta.
- Crear y editar su perfil (nombre, teléfono, foto).
- Ver sus citas próximas y pasadas.
- Cancelar una cita próxima.
- Recibir notificaciones en tiempo real sobre sus citas.
- Cambiar entre tema claro y oscuro.
- Cerrar sesión.

### 5.2. Negocio

- Editar su perfil público completo (incluido logo, galería y ubicación).
- Crear, editar y desactivar servicios.
- Definir su horario semanal.
- Recibir las nuevas citas en su panel en tiempo real.
- Confirmar, reagendar, marcar como completada o cancelar una cita.
- Crear una cita manualmente desde el propio panel.
- Descargar su código QR para imprimirlo.
- Consultar estadísticas (citas hoy/semana/mes + tendencia 12 días).

### 5.3. Administrador

- Acceder al dashboard con métricas agregadas y gráfica de altas a 30 días.
- Listar, buscar y filtrar a **todos** los usuarios de la plataforma.
- Crear, editar, **desactivar/activar** o **eliminar por completo** a cualquier usuario que no sea admin.
- Crear un negocio completo (usuario + perfil de negocio) desde la propia UI.
- Iniciar sesión desde cualquier selector (Negocio o Cliente): la app detecta su rol real y le redirige a `/admin`.

---

## 6. Despliegue

Ver `manual-despliegue.md` para el procedimiento paso a paso. Resumen:

1. Variables de entorno en Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_MAPBOX_TOKEN`.
2. Push a `main` → Vercel reconstruye y publica.
3. Migraciones SQL en orden en el SQL Editor de Supabase.

---

## 7. Roadmap post-MVP

- Reactivar RLS sobre todas las tablas con políticas por rol.
- Recuperación de contraseña por correo (RF-05, RF-06).
- Canal WhatsApp para confirmaciones (RF-25, RF-32, RF-39, RF-40, RF-41, RF-42).
- Internacionalización español + inglés (RF-43, RF-44, RF-45).
- Vista calendario día/semana en el panel del negocio (RF-33).
- Integración con Sentry, Betterstack y Umami (RNF-44, RNF-45, RNF-46).
- Auditoría WCAG 2.1 AA formal (RNF-18).
