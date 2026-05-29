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

