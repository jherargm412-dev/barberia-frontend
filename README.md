# HOUSE of CUT — Sistema de información para la barbería (Frontend)

Sistema web que permite a la barbería **HOUSE of CUT** gestionar su agenda de citas, el flujo de caja,
el inventario y el cálculo de comisiones de los barberos, con reportes, bitácora de auditoría,
pagos con tarjeta y comandos de voz.

Este repositorio es la **aplicación web** (React). Consume la API del backend:
[barberia-backend](https://github.com/jherargm412-dev/barberia-backend).

🌐 **Sistema en línea:** https://houseofcut-test-web.onrender.com/

---

## Datos académicos

| | |
|---|---|
| **Universidad** | Universidad Autónoma Gabriel René Moreno (UAGRM) |
| **Facultad** | Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones |
| **Materia** | Ingeniería de Requisitos y Modelado |
| **Docente** | Ing. Angélica Garzón Cuéllar |
| **Grupo** | 2 |
| **Metodología** | PUDS (Proceso Unificado de Desarrollo de Software) con UML |

| Integrante | Registro |
|---|---|
| Balceras Quispe Jhan Carla Anthonely | 223041726 |
| Choque Terrazas Andres Eduardo | 224027026 |
| Gonzales Montero David Jherar | 224027591 |
| Hoyos Saldaña Lucas Bastian | 223042838 |
| Pinto Alba Jose Elias | 223043826 |
| Porcel Calizaya Luis Fernando | 221045511 |

---

## Funcionalidades (casos de uso)

El sistema implementa **29 casos de uso** organizados en **7 paquetes**, desarrollados en cuatro ciclos.

| Paquete | Caso de uso | Ciclo |
|---|---|:---:|
| **Seguridad y usuarios** (`seguridad_usuarios`) | CU01 Gestionar usuarios y asignar roles | 1 |
| | CU02 Iniciar sesión | 1 |
| | CU03 Gestionar roles y permisos | 1 |
| | CU04 Configurar perfil personal | 1 |
| | CU05 Consultar bitácora | 1 |
| **Gestión de clientes** (`gestion_clientes`) | CU06 Gestionar clientes | 1 |
| | CU07 Consultar historial del cliente | 4 |
| **Servicios y reservas** (`servicios_reservas`) | CU08 Gestionar catálogo de servicios | 1 |
| | CU09 Gestionar horarios de disponibilidad | 2 |
| | CU10 Consultar disponibilidad | 2 |
| | CU11 Gestionar cita | 2 |
| | CU12 Solicitar cita | 2 |
| | CU13 Consultar servicios | 2 |
| | CU14 Registrar pago de anticipo | 2 |
| | CU15 Cancelar reserva por no pago de anticipo | 4 |
| | CU16 Consultar agenda de citas | 2 |
| **Gestión de empleados** (`gestion_empleados`) | CU17 Gestionar barbero | 1 |
| | CU18 Registrar liquidación de comisiones | 3 |
| | CU19 Consultar comisiones | 3 |
| **Ventas y caja** (`ventas_caja`) | CU20 Registrar venta | 3 |
| | CU21 Gestionar caja | 2 |
| **Inventario y compras** (`inventario_compras`) | CU22 Gestionar productos e insumos | 3 |
| | CU23 Consultar catálogo de productos | 4 |
| | CU24 Gestionar proveedores | 3 |
| | CU25 Registrar compras de productos | 3 |
| | CU26 Registrar movimiento de inventario | 4 |
| **Reportes e integraciones** (`reportes_integraciones`) | CU27 Generar reportes | 4 |
| | CU28 Comando de voz | 4 |
| | CU29 Gestionar pasarela y métodos de pago | 3 |

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Java 21 con Spring Boot 4 (Spring Security con JWT, Spring Data JPA) |
| Frontend | React 19 + TypeScript + Vite + Material UI |
| Base de datos | PostgreSQL, con migraciones Flyway |
| Pagos en línea | Stripe (modo de prueba) |
| Correo | Brevo |
| Reportes | Exportación a PDF, Excel y HTML; gráficos con MUI X Charts |
| Comandos de voz | Reconocimiento del navegador (Web Speech API) y Vosk como respaldo local |
| Despliegue | Docker + Render |

---

## Arquitectura

Aplicación **cliente–servidor** en dos repositorios: un **frontend** web (React) que consume una
**API REST** (Spring Boot).

| En los diagramas | En el backend | En el frontend |
|---|---|---|
| Paquete | `modulos/<paquete>/` | `src/modulos/<paquete>/` |
| Interfaz | — | Página en `pages/<caso_de_uso>/` |
| Control | Controlador en `controller/<caso_de_uso>/` y lógica en `service/<caso_de_uso>/` | Llamadas a la API en `api/<caso_de_uso>/` |
| Entidad | Clase en `entity/` (una tabla de la base de datos) | Tipos en `types/<caso_de_uso>.ts` |

El menú lateral del sistema también está dividido en estos 7 paquetes, con sus casos de uso dentro.

---

## Estructura del repositorio

```
barberia-frontend/
├── public/                        Íconos, imágenes y el modelo de voz (Vosk)
├── src/
│   ├── main.tsx                   Punto de entrada de React
│   ├── app/                       Rutas (AppRouter) y tema
│   ├── shared/                    Lo común: httpClient, menú lateral (MainLayout), componentes y utilidades
│   └── modulos/                   Código por paquete
│       ├── seguridad_usuarios/        CU01 a CU05
│       ├── gestion_clientes/          CU06 y CU07
│       ├── servicios_reservas/        CU08 a CU16
│       ├── gestion_empleados/         CU17 a CU19
│       ├── ventas_caja/               CU20 y CU21
│       ├── inventario_compras/        CU22 a CU26
│       └── reportes_integraciones/    CU27 a CU29
│           ├── index.ts               Lo que el paquete exporta al resto de la app
│           ├── pages/                 Pantallas, una carpeta por caso de uso
│           ├── components/            Componentes de cada caso de uso
│           ├── api/                   Llamadas al backend, por caso de uso
│           └── types/ y constants/    Tipos (copiados de los DTO) y permisos
├── docs/                          Guías de diseño
├── nginx/ y Dockerfile            Imagen para probar el despliegue con Docker
└── README.md
```

Dentro de cada paquete va primero la **capa** (`pages/`, `components/`, `api/`…) y dentro de cada capa
**una carpeta por caso de uso**, igual que en el backend. Otros paquetes solo importan lo que exporta su
`index.ts`. La guía completa está en [src/modulos/README.md](src/modulos/README.md).

---

## Ramas de trabajo (Git)

| Rama | Uso |
|---|---|
| `main` | Versión estable; es la que se despliega en Render |
| `dev-prueba` | Integración y pruebas del trabajo de todo el equipo |
| `dev-jhancarla` | Trabajo de Jhan Carla Anthonely Balceras Quispe |
| `dev-eduardo` | Trabajo de Andres Eduardo Choque Terrazas |
| `dev-jherar` | Trabajo de David Jherar Gonzales Montero |
| `dev-lucas` | Trabajo de Lucas Bastian Hoyos Saldaña |
| `dev-elias` | Trabajo de Jose Elias Pinto Alba |
| `dev-fernando` | Trabajo de Luis Fernando Porcel Calizaya |

Flujo: **rama personal → Pull Request a `dev-prueba` → pruebas → Pull Request a `main`**.
