import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { consultarRol, registrarRol } from '../../api/gestionar_roles_permisos/rolesPermisosApi';
import RolForm from '../../components/gestionar_roles_permisos/RolForm';
import {
  construirRequest,
  VALORES_VACIOS,
  valoresClonados,
  type RolFormValores,
} from '../../utils/gestionar_roles_permisos/rolForm';

/** CU03 pasos 2–3: crear rol. Con ?clonar={id} parte de los permisos de un rol existente. */
export default function RolCrearPage() {
  const navigate = useNavigate();
  const [parametros] = useSearchParams();
  const idClonar = parametros.get('clonar');

  const [iniciales, setIniciales] = useState<RolFormValores | null>(idClonar ? null : VALORES_VACIOS);
  const [origen, setOrigen] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!idClonar) return;
    consultarRol(Number(idClonar))
      .then((rol) => {
        setIniciales(valoresClonados(rol));
        setOrigen(rol.nombre);
      })
      .catch((err) => setError(obtenerError(err).mensaje));
  }, [idClonar]);

  async function guardar(valores: RolFormValores) {
    const respuesta = await registrarRol(construirRequest(valores));
    navigate('/roles', { state: { mensaje: respuesta.mensaje } });
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!iniciales) return <CircularProgress />;

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {origen ? `Nuevo rol (copia de ${origen})` : 'Nuevo rol'}
      </Typography>
      <RolForm
        valoresIniciales={iniciales}
        textoBoton="Guardar"
        onGuardar={guardar}
        onCancelar={() => navigate('/roles')}
      />
    </>
  );
}
