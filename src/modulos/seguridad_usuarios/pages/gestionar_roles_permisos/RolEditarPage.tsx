import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { consultarRol, modificarRol } from '../../api/gestionar_roles_permisos/rolesPermisosApi';
import RolForm from '../../components/gestionar_roles_permisos/RolForm';
import { ROL_ADMINISTRADOR } from '../../constants/gestionar_roles_permisos';
import type { Rol } from '../../types/gestionar_roles_permisos';
import { construirRequest, valoresDesdeRol, type RolFormValores } from '../../utils/gestionar_roles_permisos/rolForm';

/** CU03 pasos 2–3: editar nombre, descripción y permisos de un rol. */
export default function RolEditarPage() {
  const { id } = useParams(); // viene de la ruta /roles/:id/editar
  const idRol = Number(id);
  const navigate = useNavigate();

  const [rol, setRol] = useState<Rol | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    consultarRol(idRol)
      .then(setRol)
      .catch((err) => setError(obtenerError(err).mensaje));
  }, [idRol]);

  async function guardar(valores: RolFormValores) {
    const respuesta = await modificarRol(idRol, construirRequest(valores));
    navigate('/roles', { state: { mensaje: respuesta.mensaje } });
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!rol) return <CircularProgress />;

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        Editar rol
        <Chip label={rol.activo ? 'Activo' : 'Inactivo'} color={rol.activo ? 'success' : 'default'} size="small" />
      </Typography>
      {rol.cantidadUsuarios > 0 && (
        <Alert severity="warning" sx={{ mb: 2, maxWidth: 960 }}>
          {rol.cantidadUsuarios} usuario(s) tienen este rol: los cambios de permisos les aplican de inmediato.
        </Alert>
      )}
      {/* El estado no se cambia aquí: se hace desde el listado (paso 4). */}
      <RolForm
        valoresIniciales={valoresDesdeRol(rol)}
        textoBoton="Guardar"
        onGuardar={guardar}
        onCancelar={() => navigate('/roles')}
        nombreBloqueado={rol.sistema}
        permisosBloqueados={rol.nombre === ROL_ADMINISTRADOR}
      />
    </>
  );
}
