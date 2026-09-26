# Módulos

Cada carpeta aquí es **un módulo del sistema** y tiene el **mismo nombre que su paquete en el backend**:

| Backend (`com.example.backend.…`) | Frontend (`src/modulos/…`) |
|---|---|
| `modulo_seguridad_usuarios` | `seguridad_usuarios` |
| `modulo_gestion_clientes` | `gestion_clientes` |
| `modulo_gestion_empleados` | `gestion_empleados` |
| `modulo_servicios_reservas` | `servicios_reservas` |
| `modulo_ventas_caja` | `ventas_caja` |
| `modulo_inventario_compras` | `inventario_compras` |
| `modulo_reportes` | `reportes` |

## Estructura de un módulo

Igual que en el backend: **primero la capa**, y dentro de cada capa **una carpeta por caso de uso**.

```
modulos/<modulo>/
  index.ts                     lo que el módulo exporta al resto de la app
  api/<caso_de_uso>/           llamadas al backend con `http` (de shared/api/httpClient)
  components/<caso_de_uso>/    componentes que solo usa ese caso de uso
  context/<caso_de_uso>/       (opcional) estado compartido con React Context
  pages/<caso_de_uso>/         pantallas (una por ruta)
  utils/<caso_de_uso>/         (opcional) funciones de ayuda (ej. armar el body de un formulario)
  types/<caso_de_uso>.ts       tipos copiados de los DTOs del backend
  constants/<caso_de_uso>.ts   (opcional) permisos, catálogos fijos…
```

Ejemplo real:

```
modulos/seguridad_usuarios/
  index.ts
  api/          iniciar_sesion/   gestionar_usuarios/
  components/   iniciar_sesion/   gestionar_usuarios/
  context/      iniciar_sesion/
  pages/        iniciar_sesion/   gestionar_usuarios/
  utils/                          gestionar_usuarios/
  types/        iniciar_sesion.ts gestionar_usuarios.ts
  constants/                      gestionar_usuarios.ts
```

Cuando alguien haga "configurar perfil", crea `api/configurar_perfil/`, `pages/configurar_perfil/`,
`types/configurar_perfil.ts`, etc. **Solo crea las carpetas que necesite.**

## Reglas

1. **Trabaja solo en las carpetas de tu caso de uso.** Lo que otro módulo necesite de ti, expórtalo en el `index.ts` del módulo.
2. **Importa otros módulos solo por su `index.ts`**:
   `import { useAuth } from '../../seguridad_usuarios';` ✅
   `import { useAuth } from '../../seguridad_usuarios/context/iniciar_sesion/useAuth';` ❌
3. **Lo que usan varios módulos va en `src/shared/`** (componentes genéricos, utilidades). Avisa al equipo antes de cambiar algo ahí.
4. **Archivos compartidos por todos** — cambia solo tu parte y haz `git pull` antes:
   - `src/app/AppRouter.tsx`: tus rutas.
   - `src/shared/layouts/MainLayout.tsx`: tu opción del menú.

## Crear un caso de uso nuevo (ejemplo: registrar reserva en el módulo reservas)

1. Si el módulo es nuevo, crea `src/modulos/reservas/index.ts`.
2. `api/registrar_reserva/reservasApi.ts`: las llamadas (`http.post('/reservas', …)`).
3. `types/registrar_reserva.ts`: los tipos de los DTOs.
4. `pages/registrar_reserva/…Page.tsx` (y `components/registrar_reserva/` si hace falta).
5. Exporta tus páginas en el `index.ts` del módulo.
6. Agrega tus rutas en `AppRouter.tsx` y tu opción en el menú de `MainLayout.tsx`.
7. Para pedir sesión o permisos usa lo que exporta `seguridad_usuarios`:
   `useAuth`, `RequierePermiso`.
