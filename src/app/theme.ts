import { esES } from '@mui/material/locale';
import { createTheme } from '@mui/material/styles';

// Tema global de Material UI. Cambia aquí los colores de toda la app.
// esES traduce los textos internos de MUI (p. ej. la paginación: "1–20 de 51" en vez de "of").
export const theme = createTheme(
  {
    palette: {
      primary: { main: '#1f2937' },
      secondary: { main: '#b45309' },
    },
    shape: { borderRadius: 8 },
  },
  esES,
);
