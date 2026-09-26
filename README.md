# Barbería House of Cut — Frontend

Aplicación web en React 19 + TypeScript + Vite + Material UI.
Consume la API del backend: [barberia-backend](https://github.com/jherargm412-dev/barberia-backend).

## Requisitos

- **Node.js 20** o superior (incluye `npm`)
- El **backend corriendo** en `http://localhost:8080` (ver su README)
- Git

## Primera vez (configuración local)

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/jherargm412-dev/barberia-frontend.git
   cd barberia-frontend
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Copiar el archivo de variables:

   ```bash
   cp .env.example .env       # macOS / Linux / Git Bash / PowerShell
   copy .env.example .env     # Windows (CMD)
   ```

   `VITE_API_URL` es la dirección del backend. Si no cambiaste el puerto, déjala como está.

4. Levantar el frontend:

   ```bash
   npm run dev
   ```

   Abre `http://localhost:5173`. Inicia sesión con el administrador que configuraste en el
   `.env` del backend (`APP_SEED_ADMIN_EMAIL` / `APP_SEED_ADMIN_PASSWORD`).

   Cómo usar cada pantalla: [Manual de usuario](docs/manual-usuario.md).

## Comandos

| Comando | Para qué |
|---|---|
| `npm run dev` | Levanta la app en modo desarrollo (se recarga sola al guardar) |
| `npm run build` | Revisa los tipos de TypeScript y genera la versión final en `dist/` |
| `npm run lint` | Revisa el código con ESLint |

Antes de abrir un Pull Request, corre `npm run build` y `npm run lint`: los dos deben pasar sin errores.

## Estructura

```
src/
  app/          arranque: App.tsx, AppRouter.tsx (todas las rutas), theme.ts
  shared/       lo que usan todos los módulos: httpClient, layout con menú, utilidades
  modulos/      un módulo por carpeta, con el mismo nombre que en el backend
    seguridad_usuarios/
    gestion_clientes/
    gestion_empleados/
    servicios_reservas/
    ventas_caja/
    inventario_compras/
    reportes/
```

Dentro de cada módulo va primero la **capa** (`api/`, `components/`, `pages/`…) y dentro de
cada capa **una carpeta por caso de uso**, igual que en el backend.
La guía completa está en [src/modulos/README.md](src/modulos/README.md).

## Flujo de trabajo con Git

1. Actualiza `main`: `git checkout main && git pull`
2. Crea una rama para tu caso de uso: `git checkout -b feature/CU05-reservas`
3. Haz commits pequeños y sube tu rama: `git push -u origin feature/CU05-reservas`
4. Abre un **Pull Request** hacia `main` en GitHub para que otro lo revise.

No hagas push directo a `main`.
