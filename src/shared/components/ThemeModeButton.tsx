import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useColorScheme } from '@mui/material/styles';

/** Alterna el tema global; ThemeProvider conserva la preferencia en el navegador. */
export default function ThemeModeButton() {
  const { mode, systemMode, setMode } = useColorScheme();
  const oscuro = (mode === 'system' ? systemMode : mode) === 'dark';
  const etiqueta = oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';

  return (
    <Tooltip title={etiqueta}>
      <IconButton color="inherit" aria-label={etiqueta} disabled={!mode}
        onClick={() => setMode(oscuro ? 'light' : 'dark')}>
        {oscuro ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
