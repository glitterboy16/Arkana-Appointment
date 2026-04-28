# 📅 Arkana Appointments — Gestión inteligente de citas

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.x-646cff?logo=vite)
![Estado](https://img.shields.io/badge/Estado-En%20desarrollo-orange)

🧠 **Arkana Appointments** es una aplicación web final del ciclo de **Desarrollo de Aplicaciones Web (DAW)** orientada a digitalizar la gestión de citas en pequeños y medianos negocios.

Permite que cada empresa gestione su perfil, disponibilidad y reservas desde un panel centralizado, mientras los clientes reservan fácilmente desde un perfil público accesible por QR (sin instalar apps).

---

## 🌍 Descripción general

Arkana sigue una base moderna y escalable:

- 🔹 **Frontend:** React + TypeScript + Vite
- 🔹 **Arquitectura:** enfoque modular con separación por interfaces, datos y vistas
- 🔹 **Base de datos y backend real:** **pendiente de activación** (Supabase se mantiene sin tocar por ahora)
- 🔹 **Objetivo:** evitar solapamientos, reducir errores manuales y mejorar la experiencia de reserva

---

## 🎯 Objetivo del sistema

Simplificar y automatizar la gestión de citas para empresas y clientes:

- ✅ Control de disponibilidad
- ✅ Solicitud y gestión de citas
- ✅ Flujo por roles (empresa, cliente, admin)
- ✅ Base preparada para notificaciones y panel administrativo

---

## 🚀 Estado actual

Actualmente el repositorio incluye una **fase funcional inicial**:

- Vista de inicio de Arkana
- Perfil público de negocio por código QR
- Formulario básico para solicitar cita
- Panel de empresa con gestión de estado de citas
- Panel de administrador con métricas demo

> Nota: la integración real de base de datos (Supabase) se realizará en la siguiente fase, cuando esté definida la estructura final de tablas.

---

## 🧱 Estructura del proyecto

```bash
arkana/
│
├── src/
│   ├── interfaces/              # Tipos principales del dominio (Usuario, Negocio, Cita...)
│   ├── database/
│   │   ├── data/                # Datos mock para desarrollo inicial
│   │   └── supabase/            # Capa Supabase (sin tocar en esta fase)
│   ├── backend/
│   │   ├── modelos/             # Contratos de modelos de datos
│   │   └── rutas/               # Definición de rutas backend (base)
│   ├── components/
│   │   └── citas/               # Componentes de UI de citas
│   ├── pages/
│   │   └── arkana/              # Vistas principales Arkana
│   ├── App.tsx                  # Rutas de la aplicación
│   ├── main.tsx                 # Entrada principal React
│   └── index.css                # Estilos globales
│
├── package.json
├── vite.config.ts
└── README.md
```

---

## ⚙️ Instalación y ejecución local

### 1️⃣ Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd arkana
```

### 2️⃣ Instalar dependencias

```bash
npm install
```

### 3️⃣ Ejecutar en desarrollo

```bash
npm run dev
```

La app estará disponible en `http://localhost:5173`.

---

## 💻 Comandos útiles

| Acción | Comando |
|---|---|
| Instalar dependencias | `npm install` |
| Entorno desarrollo | `npm run dev` |
| Build de producción | `npm run build` |
| Previsualizar build | `npm run preview` |

---

## 👥 Roles del sistema

| Rol | Permisos principales |
|---|---|
| Empresa | Gestionar perfil, disponibilidad y estado de citas |
| Cliente | Ver negocio público y solicitar citas |
| Administrador | Supervisar datos globales e incidencias |

---

## 🧩 Funcionalidades implementadas (fase inicial)

- ✅ Navegación principal con React Router
- ✅ Perfil público del negocio por `codigoQr`
- ✅ Solicitud de cita (flujo básico)
- ✅ Gestión de estado de citas en panel empresa
- ✅ Resumen administrativo demo
- ✅ Tipado del dominio en español (interfaces TypeScript)

---

## 🧠 Tecnologías principales

| Tecnología | Uso |
|---|---|
| ⚛️ React + Vite | Frontend moderno y rápido |
| 🟦 TypeScript | Tipado estático y mantenibilidad |
| 🎨 CSS/Tailwind base | Estilos globales y estructura visual |
| 🧰 Supabase | Integración prevista para próximas fases |
| 🧾 Markdown | Documentación del proyecto |

---

## 🧑‍🏫 Tutorías

**Tutor:** Francisco José Mera Calderón  
**Centro:** IES Albarregas – Mérida (España)

### Resumen de seguimiento

Se mantiene una planificación iterativa, con revisión semanal de:

1. Avances funcionales
2. Decisiones de arquitectura
3. Bloqueos técnicos
4. Tareas de la siguiente iteración

---

## 👨‍💻 Autoría

**Angel andres villorina cambero**  
CFGS en Desarrollo de Aplicaciones Web (DAW)  
📍 IES Albarregas – Mérida (España)  
📘 Proyecto TFG: **Arkana Appointments — Gestión de citas para negocios (2026)**
