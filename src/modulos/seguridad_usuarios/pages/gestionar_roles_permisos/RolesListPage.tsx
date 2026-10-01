import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { cambiarEstadoRol, listarRolesGestion } from '../../api/gestionar_roles_permisos/rolesPermisosApi';
import RolesTabla from '../../components/gestionar_roles_permisos/RolesTabla';
import { useAuth } from '../../context/iniciar_sesion/useAuth';
import type { Rol } from '../../types/gestionar_roles_permisos';

type FiltroEstado = 'todos' | 'activos' | 'inactivos';

/** CU03 paso 1 (listado) y paso 4 (activar / desactivar sin formulario). */
export default function RolesListPage() {
  const navigate = useNavigate();
  const ubicacion = useLocation();
  const { refrescarSesion } = useAuth();

  const [roles, setRoles] = useState<Rol[]>([]);
  const [filtro, setFiltro] = useState<FiltroEstado>('todos');
  const [cargando, setCargando] = useState(true);
  const [recargar, setRecargar] = useState(0);
  const [error, setError] = useState('');
  // "Rol guardado correctamente": puede venir de crear/editar o del cambio de estado aquí.
  const [mensaje, setMensaje] = useState((ubicacion.state as { mensaje?: string } | null)?.mensaje ?? '');
  const [porCambiar, setPorCambiar] = useState<Rol | null>(null);
  const [procesando, setProcesando] = useState(false);

  // Son pocos roles: se piden todos y el filtro por estado se aplica aquí.
  useEffect(() => {
    listarRolesGestion()
      .then(setRoles)
      .catch((err) => setError(obtenerError(err).mensaje))
      .finally(() => setCargando(false));
  }, [recargar]);

  async function confirmarCambioEstado() {
    if (!porCambiar) return;
    setProcesando(true);
    setError('');
    setMensaje('');
    try {
      const respuesta = await cambiarEstadoRol(porCambiar.idRol, !porCambiar.activo);
      setMensaje(respuesta.mensaje);
      setCargando(true);
      setRecargar((n) => n + 1);
      // Activar/desactivar uno de mis roles cambia mis permisos: actualizamos menú y rutas sin recargar.
      refrescarSesion().catch(() => undefined);
    } catch (err) {
      setError(obtenerError(err).mensaje);
    } finally {
      setProcesando(false);
      setPorCambiar(null);
    }
  }

  const visibles = roles.filter((r) => filtro === 'todos' || r.activo === (filtro === 'activos'));
  const vaADesactivar = porCambiar?.activo === true;
  const usuarios = porCambiar?.cantidadUsuarios ?? 0;

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography variant="h5">Roles y permisos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/roles/nuevo')}>
          Nuevo rol
        </Button>
      </Box>

      <ToggleButtonGroup
        exclusive
        size="small"
        value={filtro}
        onChange={(_, valor: FiltroEstado | null) => valor && setFiltro(valor)}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="todos">Todos</ToggleButton>
        <ToggleButton value="activos">Activos</ToggleButton>
        <ToggleButton value="inactivos">Inactivos</ToggleButton>
      </ToggleButtonGroup>

      {mensaje && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMensaje('')}>
          {mensaje}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {cargando && <LinearProgress />}

      <RolesTabla roles={visibles} onCambiarEstado={setPorCambiar} />

      <ConfirmDialog
        abierto={porCambiar !== null}
        titulo={vaADesactivar ? 'Desactivar rol' : 'Activar rol'}
        mensaje={
          vaADesactivar
            ? `"${porCambiar?.nombre}" dejará de otorgar permisos` +
              (usuarios > 0 ? ` a ${usuarios} usuario(s) que lo tienen asignado` : '') +
              ' y no se podrá asignar a nuevos usuarios. Sus permisos configurados se conservan.'
            : `"${porCambiar?.nombre}" volverá a otorgar sus permisos y se podrá asignar a usuarios.`
        }
        textoConfirmar={vaADesactivar ? 'Desactivar' : 'Activar'}
        cargando={procesando}
        onConfirmar={confirmarCambioEstado}
        onCancelar={() => setPorCambiar(null)}
      />
    </>
  );
}
