import { createTheme } from '@mui/material/styles';

// Tema global de Material UI. Cambia aquí los colores de toda la app.
export const theme = createTheme({
  palette: {
    primary: { main: '#1f2937' },
    secondary: { main: '#b45309' },
  },
  shape: { borderRadius: 8 },
});
