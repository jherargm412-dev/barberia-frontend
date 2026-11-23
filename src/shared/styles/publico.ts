// Estilo de las páginas públicas (portada y catálogos): titulares condensados en mayúsculas, al estilo de un
// letrero de barbería clásica, sobre la paleta del tema (funciona en modo claro y oscuro).

/** Fuente de los titulares públicos; si no carga, cae a la del resto de la app. */
export const FUENTE_TITULOS = '"Oswald", Inter, "Segoe UI", Arial, sans-serif';

/** Ancho máximo del contenido público. */
export const ANCHO_PUBLICO = 1200;

/** Titular de sección: "LO QUE HACEMOS". */
export const sxTituloSeccion = {
  fontFamily: FUENTE_TITULOS,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  lineHeight: 1.05,
  fontSize: { xs: '2.1rem', md: '3rem' },
} as const;

/** Etiqueta pequeña sobre un titular, con una línea dorada delante. */
export const sxEtiqueta = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 1.25,
  color: 'primary.main',
  fontSize: 12.5,
  fontWeight: 600,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  '&::before': { content: '""', width: 28, height: '1px', bgcolor: 'primary.main' },
} as const;

/** Precio en cifras grandes y condensadas. */
export const sxPrecio = {
  fontFamily: FUENTE_TITULOS,
  fontWeight: 500,
  letterSpacing: '0.01em',
  lineHeight: 1.1,
} as const;

/** Botón en forma de píldora. */
export const sxPildora = { borderRadius: 999, px: 3 };

/** Tarjeta pública: superficie con borde fino y esquinas amplias, que se eleva al pasar el mouse. */
export const sxTarjetaPublica = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '22px',
  border: 1,
  borderColor: 'divider',
  boxShadow: 'none',
  overflow: 'hidden',
  transition: 'transform 200ms ease-out, border-color 200ms ease-out',
  '&:hover': { transform: 'translateY(-3px)', borderColor: 'primary.main' },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none', '&:hover': { transform: 'none' } },
} as const;
