import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../modulos/seguridad_usuarios';
import AppRouter from './AppRouter';
import { theme } from './theme';

/** Componente raíz: aquí se "enchufan" los providers globales. */
export default function App() {
  return (
    // MUI guarda la elección y presenta el diseño oscuro en la primera visita.
    <ThemeProvider theme={theme} defaultMode="dark" modeStorageKey="houseofcut-mode" disableTransitionOnChange>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
