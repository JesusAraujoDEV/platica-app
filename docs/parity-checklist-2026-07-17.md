# Web → mobile parity checklist (2026-07-17)

## Estado

Auditado e implementado en una primera fase. La aplicación móvil ya autentica contra el backend, restaura y elimina la sesión, carga datos reales y expone desde `Más` las áreas principales que antes sólo estaban disponibles en web. Esto no equivale a paridad CRUD completa.

## Cambios web revisados

| Cambio en web/backend | Respuesta móvil actual | Pendiente |
|---|---|---|
| Limpieza de i18n en ES/EN/DE | Se ampliaron las traducciones móviles y las pantallas nuevas usan `t()` | Revisar nuevas claves cuando se incorporen gráficos y filtros avanzados |
| Estadísticas con comparaciones flexibles | `Más > Estadísticas` muestra el resumen real de ingresos y gastos del periodo | Selectores de periodos, comparación arbitraria, métricas derivadas y gráficos nativos |
| Historial de tasas con paginación web | `Más > Tasas` consulta el historial real | Controles de paginación y filtros nativos |
| Nuevas fechas ISO en endpoints comparativos | El cliente móvil no depende de los nombres de periodo retirados | Formatear localmente los periodos cuando se implemente la comparación avanzada |
| Corrección backend de sincronización de tasas | No requiere cambio móvil; consume el mismo backend | Ninguno en el cliente para el backfill |

## Cobertura móvil resultante

- Login local real, token en SecureStore, validación mediante `GET /auth/me`, manejo central de 401 y logout local-first.
- Dashboard, cuentas y transacciones conectados al backend con estados de carga, error, vacío y reintento.
- Consulta desde `Más` de suscripciones, categorías, grupos, presupuestos, deudas, tasas, estadísticas y calendario.
- Calendario conectado a `agenda/forecast`.
- URL pública segura como fallback: `https://wallets.irissoftware.lat/api`.

## Brechas aceptadas

La navegación móvil prioriza uso nativo y no replica las doce áreas como tabs. Las áreas de `Más` son inicialmente de consulta; altas, ediciones, eliminaciones, pagos, vínculos, filtros avanzados, exportaciones y gráficos continúan siendo brechas explícitas. Google nativo, registro y recuperación de contraseña también permanecen pendientes.

La matriz detallada y los gates de dispositivo están en [`incidents/2026-07-17-apk-mobile-readiness.md`](incidents/2026-07-17-apk-mobile-readiness.md).
