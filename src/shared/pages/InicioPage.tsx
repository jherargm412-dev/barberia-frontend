import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAuth } from '../../modulos/seguridad_usuarios';

export default function InicioPage() {
  const { usuario } = useAuth();

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Bienvenido, {usuario?.nombre}
      </Typography>
      <Stack direction="row" spacing={1}>
        {usuario?.roles.map((rol) => (
          <Chip key={rol} label={rol} color="primary" variant="outlined" />
        ))}
      </Stack>
    </Paper>
  );
}
