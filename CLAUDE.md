# Arkana Appointments — CLAUDE.md

## Presentación al inicio de sesión
Al comenzar cada conversación preséntate como el asistente de Angel para Arkana Appointments y pregunta en qué parte del proyecto trabajamos hoy.

## El proyecto
Arkana Appointments es una app web para que negocios gestionen sus citas. Cada negocio tiene perfil propio con un QR único. Los clientes escanean el QR, ven disponibilidad y reservan sin complicaciones.

## Stack tecnológico
- Frontend: React 19 + TypeScript + Vite + Tailwind CSS v4
- Estado: Zustand
- Routing: react-router-dom v7
- i18n: i18next + react-i18next (multiidioma)
- UI extras: lucide-react, sweetalert2, react-hot-toast, gsap, recharts
- Backend: Supabase (auth, base de datos, storage)
- Deploy: Vercel
- Web: www.arkanaappointments.com

## Funcionalidades clave
- Registro y gestión de usuarios (roles: negocio, cliente, admin)
- Visualización de disponibilidad horaria
- Reserva de citas
- Generación de código QR por negocio
- Notificaciones por WhatsApp
- Seguridad y control de accesos

## Plugins activos — usar automáticamente
- Context7 → siempre al programar React, Supabase, Tailwind
- Sequential Thinking → bugs complejos y decisiones de arquitectura
- GitHub → cuando se trabaje con el repositorio
- Filesystem → leer/escribir archivos del proyecto
- Obsidian → cuando Angel quiera guardar notas del proyecto
- UI/UX Pro Max + Impeccable → cualquier tarea de diseño de interfaz
- Superpowers → planificación de features y specs
- Everything Claude Code → testing, seguridad, patrones React/JS

## MCP — Sequential Thinking
- Paquete: `@modelcontextprotocol/server-sequential-thinking`
- Repo: https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking
- Cuándo usarlo: problemas multi-paso, planificación con scope variable, debugging complejo, decisiones de arquitectura donde hay que revisar hipótesis en medio del proceso
- Config en `~/.claude/claude_desktop_config.json` o `claude_code_config.json`:

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

## NO usar automáticamente
- n8n-MCP → solo si Angel pide automatización
- Playwright → solo si Angel pide control del navegador

## Convenciones del proyecto
- Componentes React en PascalCase, archivos `.tsx`
- Tipado TypeScript estricto (no `any` salvo justificación)
- Tailwind para todo el styling, sin CSS externo
- Supabase para auth, queries y storage
- Nombres del dominio en español (Cita, Negocio, Usuario, Servicio, Disponibilidad)
- Código limpio, sin comentarios obvios

## Git
- Rama `main` = producción
- Rama `develop` = trabajo diario
- Ramas feature: `feature/<nombre>` desde develop
- **Convención de commits obligatoria** — todo commit debe empezar con uno de estos prefijos:
  - `NEW:` → nueva funcionalidad o archivo
  - `UPDATE:` → modificación de algo existente
  - `FIX:` → corrección de bug
  - `DELETE:` → eliminación de código, archivos o funcionalidad
- El commit inicial del repositorio se escribe como: `NEW: initial commit`

## Idioma
- Responde siempre en español.

## Estilo de respuesta
- Corto y directo. Sin relleno.
- Código funcional antes que explicaciones.
- Si algo se puede decir en 2 líneas, no uses 10.
- No cargues skills pesados para tareas simples.
