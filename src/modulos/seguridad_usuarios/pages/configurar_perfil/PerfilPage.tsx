import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { consultarPerfil } from '../../api/configurar_perfil/perfilApi';
import CambiarContrasenaForm from '../../components/configurar_perfil/CambiarContrasenaForm';
import DatosPersonalesForm from '../../components/configurar_perfil/DatosPersonalesForm';
import InformacionLaboral from '../../components/configurar_perfil/InformacionLaboral';
import SesionesRecientes from '../../components/configurar_perfil/SesionesRecientes';
import { useAuth } from '../../context/iniciar_sesion/useAuth';
import type { Perfil } from '../../types/configurar_perfil';

/** CU04 Configurar Perfil Personal: consultar, editar datos y cambiar contraseña. */
export default function PerfilPage() {
  const { refrescarSesion } = useAuth();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    consultarPerfil()
      .then(setPerfil)
      .catch((err) => setError(obtenerError(err).mensaje));
  }, []);

  function alGuardar(actualizado: Perfil) {
    setPerfil(actualizado);
    // El nombre también se muestra en la barra superior: lo actualizamos sin recargar.
    refrescarSesion().catch(() => undefined);
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!perfil) return <CircularProgress />;

  return (
    <>
      <Typography variant="h5">Mi perfil</Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography color="text.secondary">{perfil.correo}</Typography>
        {perfil.roles.map((rol) => (
          <Chip key={rol} label={rol} size="small" color="primary" variant="outlined" />
        ))}
      </Stack>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, alignItems: 'start' }}>
        <Stack spacing={3}>
          <DatosPersonalesForm perfil={perfil} onGuardado={alGuardar} />
          {perfil.empleado && <InformacionLaboral empleado={perfil.empleado} />}
        </Stack>
        <Stack spacing={3}>
          <CambiarContrasenaForm />
          <SesionesRecientes />
        </Stack>
      </Box>
    </>
  );
}
