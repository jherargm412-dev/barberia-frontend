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

## Comandos

| Comando | Para qué |
|---|---|
| `npm run dev` | Levanta la app en modo desarrollo (se recarga sola al guardar) |
| `npm run build` | Revisa los tipos de TypeScript y genera la versión final en `dist/` |
| `npm run lint` | Revisa el código con ESLint |

Antes de abrir un Pull Request, corre `npm run build` y `npm run lint`: los dos deben pasar sin errores.

## Despliegue (Railway)

Railway construye la imagen con el `Dockerfile` (compila con Vite y sirve con nginx) cada vez
que se hace merge a `main`.

- Variable del servicio: `VITE_API_URL=https://<backend>.up.railway.app/api/v1`.
  Se fija **al compilar**: si la cambias, hay que volver a desplegar (no basta con reiniciar).
- `nginx/default.conf.template` devuelve `index.html` para cualquier ruta, así funcionan los
  enlaces directos como `/activar?token=...` y recargar la página en `/usuarios`.

### Probar la imagen en tu máquina (Docker Desktop)

Con el backend levantado (`docker compose up` en el repo del backend):

```bash
docker build --build-arg VITE_API_URL=http://localhost:8080/api/v1 -t barberia-frontend .
docker run --rm -p 8081:80 barberia-frontend
```

Abre `http://localhost:8081`.

## 📁 Estructura del Repositorio

```
barberia-frontend/
│
├── public/                     # Íconos y recursos públicos
├── src/
│   ├── main.tsx                # Punto de entrada de React
│   ├── app/                    # App, rutas (AppRouter) y tema
│   ├── shared/                 # Lo común: httpClient, layout, componentes
│   └── modulos/
│       ├── seguridad_usuarios/ # CU01, CU02, CU05 (Usuarios, Login, Bitácora)
│       ├── gestion_clientes/   # CU06 (Clientes)
│       ├── gestion_empleados/  # Por implementar
│       ├── servicios_reservas/ # CU08 (Catálogo de servicios, Reservas)
│       ├── ventas_caja/        # Por implementar
│       ├── inventario_compras/ # Por implementar
│       └── reportes/           # Por implementar
│
├── nginx/                      # Configuración de nginx para la imagen de Docker
├── Dockerfile                  # Imagen para Railway
├── .env.example                # Plantilla de variables (VITE_API_URL)
├── vite.config.ts              # Configuración de Vite
└── package.json                # Dependencias y scripts
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
