import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAuth } from '../../modulos/seguridad_usuarios';
import PageHeader from '../components/PageHeader';

export default function InicioPage() {
  const { usuario } = useAuth();

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: 1, borderColor: 'divider' }}>
      <PageHeader title="Inicio" description="Selecciona un apartado del menú para comenzar." />
      <Typography variant="h5" sx={{ mb: 1 }}>
        Bienvenido, {usuario?.nombre}
      </Typography>
      <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: 'wrap' }}>
        {usuario?.roles.map((rol) => (
          <Chip key={rol} label={rol} color="primary" variant="outlined" />
        ))}
      </Stack>
    </Paper>
  );
}
