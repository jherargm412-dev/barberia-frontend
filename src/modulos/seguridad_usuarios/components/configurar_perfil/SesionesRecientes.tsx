import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { listarSesionesRecientes } from '../../api/configurar_perfil/perfilApi';
import type { InicioSesionReciente } from '../../types/configurar_perfil';
import { formatearFechaHora } from '../../utils/consultar_bitacora/formatoBitacora';

/** Extra de CU04: los 10 últimos inicios de sesión del usuario (para detectar accesos extraños). */
export default function SesionesRecientes() {
  const [sesiones, setSesiones] = useState<InicioSesionReciente[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    listarSesionesRecientes()
      .then(setSesiones)
      .catch((err) => setError(obtenerError(err).mensaje));
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6">Inicios de sesión recientes</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {sesiones && sesiones.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Sin registros
        </Typography>
      )}
      <List dense>
        {sesiones?.map((s, i) => (
          <ListItem key={`${s.fechaHora}-${i}`} disableGutters>
            <ListItemText
              primary={formatearFechaHora(s.fechaHora)}
              secondary={s.ipOrigen ? `Desde ${s.ipOrigen}` : undefined}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
