# Incidencias del APK y preparación móvil — 2026-07-17

## Resultado

El APK probado correspondía a un prototipo móvil incompleto. Los fallos observados no eran causados principalmente por CORS: el cliente entraba al área privada sin autenticar, no consumía datos del backend y el botón de cierre de sesión no ejecutaba ninguna acción.

Este documento registra qué ocurrió, qué se corrigió y qué queda pendiente antes de considerar paridad completa con la web.

## Incidencias confirmadas

| ID | Severidad | Incidencia | Causa | Estado |
|---|---|---|---|---|
| MOB-001 | Crítica | Android mostraba el icono predeterminado de Expo | `android.adaptiveIcon.foregroundImage` apuntaba a `android-icon-foreground.png`, que era el recurso azul de Expo | Corregida: usa `assets/adaptive-icon.png`, derivado del icono PWA web |
| MOB-002 | Crítica | La app abría Inicio sin una sesión válida | El botón de Google ejecutaba directamente `router.replace('/(tabs)')`; no existía guarda global | Corregida: login local real, restauración con `GET /auth/me` y guarda de rutas |
| MOB-003 | Crítica | Cerrar sesión no hacía nada | La confirmación tenía `onPress: () => {}` | Corregida: logout best-effort contra backend, borrado obligatorio de SecureStore y reemplazo de navegación |
| MOB-004 | Mayor | Inicio, movimientos y cuentas aparecían vacíos aunque hubiera datos | Las pantallas eran placeholders y no importaban `apiClient` | Corregida: consumen resumen, transacciones y cuentas con estados de carga, error, vacío y reintento |
| MOB-005 | Mayor | La URL podía caer en localhost fuera de EAS | El cliente usaba `http://localhost:3000/api` como fallback | Corregida: fallback seguro al backend público y perfil EAS explícito |
| MOB-006 | Mayor | Faltaban áreas presentes en web | Móvil sólo exponía cuatro tabs | Parcialmente corregida: `Más` da acceso de lectura a suscripciones, categorías, grupos, presupuestos, deudas, tasas, estadísticas y calendario |
| WEB-001 | Mayor | Varias acciones web no coincidían con rutas/respuestas backend | Adaptadores usaban query string donde backend exige `/:id` y no desenvolvían `{ data }`/`{ tx }` | Corregida en perfil, presupuestos, grupos, deudas, recurrencias y confirmación de pendientes |

## CORS

React Native no está sujeto a la política CORS del navegador de la misma forma que una aplicación web. El backend permite peticiones sin cabecera `Origin`, por lo que CORS no explicaba el comportamiento del APK. Expo Web y `wallets-frontend` sí requieren que su origen aparezca exactamente en `FRONTEND_URLS`; el servidor activo no interpreta comodines.

## Autenticación móvil actual

1. La app lee `platica_auth_token` desde SecureStore.
2. Si existe, lo valida con `GET /api/auth/me` antes de mostrar rutas privadas.
3. Un 401 elimina la sesión; un fallo de red muestra reintento sin simular autenticación.
4. El login usa `POST /api/auth/login` con usuario/correo y contraseña.
5. El logout intenta `POST /api/auth/logout`, pero siempre borra la sesión local aunque no haya red.
6. Google ya no permite saltarse la autenticación. Sigue pendiente configurar client IDs nativos y obtener un ID token real antes de habilitarlo.

## Paridad web–móvil

| Área | Web | Móvil después de esta corrección | Brecha restante |
|---|---|---|---|
| Login y sesión | Completo | Login local, persistencia y logout | Google, registro y recuperación nativos |
| Resumen | Completo | Resumen y movimientos recientes reales | Gráficos y filtros avanzados |
| Transacciones | CRUD/filtros/exportación | Listado real | Alta, edición, filtros y exportación |
| Cuentas | CRUD | Listado real | Alta, edición y eliminación |
| Suscripciones | CRUD y pagos | Consulta desde `Más` | Acciones de edición/pago |
| Categorías y grupos | CRUD | Consulta desde `Más` | Acciones CRUD/asignación |
| Presupuestos | CRUD/estado | Consulta de estado | Acciones CRUD |
| Deudas | CRUD/pagos/vínculos | Consulta | Acciones y vínculos |
| Tasas | Historial paginado | Consulta | Controles de paginación/filtros nativos |
| Estadísticas | Comparación flexible | Resumen MTD de ingresos y gastos | Selector de periodos, gráficos y métricas derivadas |
| Calendario | Agenda completa | Consulta | Creación/edición y UX calendario |
| Perfil | Completo | Identidad, tema, idioma y logout | Edición de perfil/cambio de contraseña |

No se declara paridad completa: el objetivo de esta corrección es que el APK sea autenticado, conectado y verificable, y que todas las áreas sean descubribles sin fingir funcionalidades inexistentes.

## Build local reproducible en Windows

Requisitos:

- Node y dependencias del lockfile.
- Android Studio con SDK en `%LOCALAPPDATA%\Android\Sdk`.
- JBR/JDK de Android Studio en `%ProgramFiles%\Android\Android Studio\jbr`.
- Git y PowerShell.
- Repositorio limpio: el script construye exactamente `HEAD`.

Desde `platica-app`:

```powershell
npm run android:apk
```

El script crea un worktree físico corto en `C:\platica-apk-build` para evitar el límite de rutas de CMake/Ninja, instala con `npm ci`, valida Expo y TypeScript, ejecuta `expo prebuild`, compila `assembleRelease` y copia el resultado a:

```text
platica-app\artifacts\platica-v0.1.0.apk
```

La URL predeterminada incluida es:

```text
https://wallets.irissoftware.lat/api
```

Puede sobrescribirse:

```powershell
.\scripts\build-android-apk.ps1 -ApiUrl "https://otro-host/api" -WorktreePath "C:\otro-build-corto"
```

El APK local usa la firma de desarrollo generada por Expo y sirve para instalación interna. La distribución pública debe seguir usando credenciales protegidas de EAS/Play Store.

## Gates antes de entregar otro APK

```powershell
npm ci --include=dev
npx expo install --check --npm
npx expo-doctor
npx tsc --noEmit
npm run android:apk
```

Además, verificar manualmente en un dispositivo:

1. El launcher muestra el logo de Platica, no Expo.
2. Sin token, sólo aparece login.
3. Credenciales inválidas no abren Inicio.
4. Credenciales válidas muestran datos reales o un vacío confirmado por la API.
5. Reiniciar conserva una sesión válida.
6. Logout funciona incluso sin red y Back no reabre las tabs.
7. `Más` abre cada área sin errores 401/404 inesperados.

## Evidencia histórica

- El build local anterior superó Gradle, pero validaba únicamente compilación; no validaba comportamiento ni identidad visual del launcher.
- El build EAS corregido de dependencias fue enviado con versión `0.1.0`; cualquier artefacto anterior a estas correcciones de auth/icono queda obsoleto.
- La versión permanece en `0.1.0`; no se mueve el tag existente sin una decisión explícita.
