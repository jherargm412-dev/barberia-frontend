# Diseño común de HOUSE of CUT

La aplicación utiliza Material UI. Los siguientes módulos deben reutilizar esta base.

- `src/app/theme.ts` define colores, tipografía, bordes y estilos de componentes.
- `ThemeModeButton` alterna claro y oscuro. `ThemeProvider` guarda la preferencia
  con la clave `houseofcut-mode`; la primera visita sigue el modo del dispositivo.
- Usa colores del tema (`background.default`, `background.paper`, `text.primary`,
  `text.secondary`, `divider`) en vez de colores fijos en las pantallas.
- Mantén los colores de error, advertencia y éxito para comunicar estados.
- Usa `PageHeader` para el título, descripción breve y acción principal de un listado.
- Coloca los componentes usados por varios módulos en `src/shared/components/`.
- Los filtros deben ajustarse en varias filas; las tablas conservan desplazamiento
  horizontal en su contenedor para no ocultar columnas en celulares.
- Toda acción debe tener un nombre accesible y poder ejecutarse con teclado.
- Los permisos siguen controlando qué rutas, opciones y acciones se muestran.

## Ejemplo de encabezado

```tsx
import PageHeader from '../../../../shared/components/PageHeader';

<PageHeader
  title="Clientes"
  description="Consulta los clientes y administra sus datos y estado."
  action={<Button variant="contained">Nuevo cliente</Button>}
/>
```

Clientes, Bitácora, Usuarios, Barberos, Servicios, Roles y Perfil usan el encabezado
común. `PersonIdentity` muestra un avatar decorativo con iniciales en las tablas de
Usuarios y Barberos; no exige fotografías ni nuevas dependencias.

El fondo animado del login y los avatares geométricos del ejemplo están pendientes.

## Pulido visual con better-ui

| Severidad | Ubicación | Antes | Después | Principio e impacto |
| --- | --- | --- | --- | --- |
| MEDIUM | `src/app/theme.ts`, tarjetas y formularios de todos los módulos | Superficies con profundidad y bordes inconsistentes | Sombras neutras suaves y radios comunes | Profundidad de superficies: diferencia tarjetas sin cargar la interfaz |
| MEDIUM | Tablas de Usuarios, Barberos, Servicios, Roles y Bitácora | Mensaje vacío durante carga o error | Estado vacío solo cuando finaliza una consulta sin error | Estados coherentes: evita información contradictoria |
| MEDIUM | `src/shared/components/ConfirmDialog.tsx` | El diálogo podía cerrarse mientras procesaba | Acción con indicador de carga y cierre bloqueado durante la operación | Feedback estático y control de interacción |
| LOW | `src/app/theme.ts`, botones y acciones | Foco y áreas de interacción variables | Áreas de 44 px para iconos y foco visible | Interacciones claras para teclado y celular |
| LOW | Login y páginas de edición | Identidad genérica y títulos dispares | Marca HOUSE of CUT y encabezados comunes | Jerarquía coherente entre módulos |

Verificación: compilación TypeScript/Vite y ESLint correctos. Login comprobado en
navegador con validación vacía, ambos temas y 390 px sin desbordamiento horizontal.
Hover, foco, active, loading y empty revisados en los componentes modificados.
El pulso de botones dura 150 ms y usa escala 0.96; movimiento reducido lo desactiva.
`disableTransitionOnChange` evita transiciones globales al cambiar de tema.

Not verified: recorrido visual autenticado completo, operaciones reales de guardado,
animaciones al 10 % de velocidad y prueba en teléfono físico.

Approve para el alcance inspeccionado; las comprobaciones pendientes no se consideran aprobadas.
