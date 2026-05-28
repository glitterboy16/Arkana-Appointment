# Arkana Appointments

## Manual de Despliegue

---

**Autor:** Ángel Andrés Villorina Cambero
**Ciclo formativo:** DAW2-A
**Proyecto:** Proyecto Final de Grado
**Centro educativo:** IES Albarregas
**Lugar y fecha:** Mérida, Badajoz — Junio 2026

---

# Manual de despliegue

## URL de la aplicación

**Producción:** [https://www.arkana-appointments.com](https://www.arkana-appointments.com)

El despliegue es automático: cada push a la rama `main` dispara un nuevo deploy en Vercel.

## Usuarios de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Administrador (Tribunal 1) | `admin@gmail.com` | `admin123` |
| Administrador (Tribunal 2) | `admin2@gmail.com` | `admin123` |
| Negocio (ejemplo) | `N-ejemplo@gmail.com` | `negocio123` |
| Cliente (ejemplo) | `C-ejemplo@gmail.com` | `cliente123` |

> El administrador puede iniciar sesión desde la página de login marcando indistintamente el selector **Negocio** o **Cliente**: la aplicación detecta su rol real y le redirige a `/admin`.

## Cómo desplegar el proyecto desde cero

### 1. Requisitos

- Node.js ≥ 20.10
- npm ≥ 10
- Cuenta gratuita en [Vercel](https://vercel.com)
- Cuenta gratuita en [Supabase](https://supabase.com) (región EU)
- Cuenta gratuita en [Mapbox](https://account.mapbox.com) para el token de mapas

### 2. Clonar y configurar

```bash
git clone https://github.com/glitterboy16/Arkana-Appointment.git
cd Arkana-Appointment
npm install
cp .env.example .env.local
```

Rellenar `.env.local` con tres valores:

```
VITE_SUPABASE_URL="https://<tu-proyecto>.supabase.co"
VITE_SUPABASE_ANON_KEY="<anon-key-publica>"
VITE_MAPBOX_TOKEN="pk.<tu-token-de-mapbox>"
```

### 3. Base de datos

En el proyecto de Supabase, abrir el **SQL Editor** y ejecutar **en orden** las migraciones de la carpeta `supabase/migrations/`. El número de archivo indica el orden:

| Archivo | Contenido |
|---|---|
| `001_esquema_completo.sql` | Columnas, tablas auxiliares, RLS, Storage y Realtime |
| `002_admin_panel.sql` | Rol admin, RPCs y usuario administrador inicial |
| `003_whatsapp_notificaciones.sql` | Opt-in WhatsApp, log de envíos y notificaciones persistentes |
| `004_unique_slot.sql` | Índice único que impide solapamiento de citas activas |

### 4. Despliegue en Vercel

1. Importar el repo desde Vercel.
2. Framework: **Vite** (autodetectado).
3. Build command: `npm run build`. Output: `dist`.
4. Variables de entorno → marcar los 3 environments (Production, Preview, Development) para cada una.
5. Asignar dominio: `www.arkana-appointments.com`.

A partir de aquí, cualquier push a `main` despliega producción y cualquier push a una rama `feature/*` genera un preview deployment.

### 5. Verificación

- Abrir la URL pública → debe cargar la landing.
- Iniciar sesión con un usuario de prueba → debe redirigir al panel correspondiente.
- Crear una cita desde un negocio publicado → debe aparecer en el panel del negocio en tiempo real.
