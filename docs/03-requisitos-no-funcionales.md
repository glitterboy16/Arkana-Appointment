# 3. Requisitos no funcionales

Los requisitos no funcionales definen **cómo** debe comportarse el sistema: atributos de calidad, restricciones técnicas y exigencias del entorno. Se numeran con el prefijo `RNF-XX`.

## 3.1. Rendimiento

| ID | Requisito | Métrica objetivo |
|---|---|---|
| RNF-01 | Tiempo de carga inicial de cualquier página pública en red 4G. | < 2,5 s (LCP) |
| RNF-02 | Tiempo de respuesta de una operación de reserva de cita. | < 1,5 s |
| RNF-03 | Consultas de disponibilidad horaria servidas en tiempo real. | < 500 ms |
| RNF-04 | Tamaño del bundle de producción minificado y comprimido (gzip). | < 300 KB inicial |
| RNF-05 | La aplicación debe soportar al menos **500 reservas diarias** por negocio sin degradación perceptible. | 500 reservas/día |

## 3.2. Seguridad

| ID | Requisito |
|---|---|
| RNF-06 | Toda la comunicación entre el usuario y la aplicación debe ser **segura y cifrada** (HTTPS). |
| RNF-07 | Las contraseñas nunca se guardan tal cual; el sistema las protege internamente de forma que no puedan leerse aunque alguien acceda a la base de datos. |
| RNF-08 | Cada usuario solo puede ver y modificar sus propios datos según su rol (cliente, empresa o admin). El sistema aplica **RLS (Row Level Security)** en la base de datos para garantizarlo. |
| RNF-09 | Las páginas privadas de la aplicación verifican que el usuario ha iniciado sesión antes de mostrar el contenido. |
| RNF-10 | Las claves y tokens privados (WhatsApp, base de datos) **nunca** llegan al navegador del usuario; se gestionan solo en el servidor. |
| RNF-11 | Los archivos de configuración con datos sensibles no se suben al repositorio. |
| RNF-12 | La aplicación cumple con la normativa de protección de datos (RGPD): el usuario puede pedir borrar sus datos y hay política de privacidad visible. |
| RNF-13 | El enlace de recuperación de contraseña expira en **1 hora** desde su envío. |
| RNF-14 | El sistema registra eventos clave: inicio de sesión, reserva, cancelación de cita y suspensión de usuario. |

## 3.3. Usabilidad y accesibilidad

| ID | Requisito |
|---|---|
| RNF-16 | La interfaz debe ser **responsive** y funcionar correctamente en resoluciones desde 320 px (móvil) hasta 1920 px (escritorio). |
| RNF-17 | El flujo de reserva debe completarse en **menos de 5 pasos** desde el escaneo del QR hasta la confirmación. |
| RNF-18 | El sistema debe cumplir las pautas **WCAG 2.1 nivel AA** en contraste de color, navegación por teclado y etiquetas de formulario. |
| RNF-19 | Los mensajes de error deben ser **comprensibles** para el usuario final (sin exponer trazas técnicas). |
| RNF-20 | El sistema debe estar disponible en **español e inglés** como mínimo. |
| RNF-21 | La interfaz debe soportar **tema claro y oscuro**. |

## 3.4. Disponibilidad y fiabilidad

| ID | Requisito | Métrica |
|---|---|---|
| RNF-22 | Disponibilidad mensual del servicio. | ≥ 99 % (uptime Vercel + Supabase) |
| RNF-23 | El sistema debe degradar con elegancia si el envío de WhatsApp falla: la cita se registra y se notifica al usuario del fallo. | — |
| RNF-24 | La base de datos debe contar con **backups diarios** automáticos (proporcionado por Supabase). | Retención 7 días |

## 3.5. Mantenibilidad

| ID | Requisito |
|---|---|
| RNF-25 | El código fuente se escribe en **TypeScript estricto**, evitando el uso de `any` salvo justificación documentada. |
| RNF-26 | El proyecto sigue la separación por **capas**: presentación (components/pages), estado (store), dominio (interfaces), datos (repositories), infraestructura (supabase). |
| RNF-27 | El repositorio mantiene una estrategia de ramas **GitFlow simplificada**: `main` (producción), `develop` (integración), `feature/*` (trabajo diario). |
| RNF-28 | Cada funcionalidad nueva se integra mediante **Pull Request** con revisión antes de mergear a `develop`. |
| RNF-29 | El proyecto dispone de un **README** actualizado y de documentación funcional en la carpeta `docs/`. |

## 3.6. Compatibilidad

| ID | Requisito |
|---|---|
| RNF-31 | La aplicación debe funcionar correctamente en los navegadores modernos más usados (Chrome, Firefox, Safari, Edge) y en dispositivos móviles con iOS 15+ o Android 10+, sin requerir instalación de nada adicional por parte del usuario. |

## 3.7. Despliegue y entorno

| ID | Requisito |
|---|---|
| RNF-37 | El despliegue de producción se realiza en **Vercel**, con integración continua desde la rama `main`. |
| RNF-38 | Los despliegues de vista previa (preview deployments) se generan automáticamente por cada Pull Request. |
| RNF-39 | La base de datos y el sistema de autenticación residen en **Supabase** (EU region). |
| RNF-40 | Las variables de entorno se gestionan en Vercel (producción) y en `.env` local (desarrollo). |

## 3.8. Legal y conformidad

| ID | Requisito |
|---|---|
| RNF-41 | La aplicación debe disponer de **Política de Privacidad** y **Términos de Uso** accesibles desde cualquier página pública. |
| RNF-42 | Los datos personales de clientes (nombre, teléfono, correo) deben almacenarse **solo** el tiempo necesario para la ejecución del servicio y eliminarse a petición del titular. |
| RNF-43 | El sistema debe incluir un **aviso de cookies** conforme a la normativa europea. |
