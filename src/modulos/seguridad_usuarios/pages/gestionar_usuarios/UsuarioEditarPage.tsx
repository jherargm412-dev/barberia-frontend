import PageHeader from '../../../../shared/components/PageHeader';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { actualizarUsuario, consultarUsuario } from '../../api/gestionar_usuarios/usuariosApi';
import UsuarioForm from '../../components/gestionar_usuarios/UsuarioForm';
import type { UsuarioDetalle } from '../../types/gestionar_usuarios';
import { construirRequest, valoresDesdeUsuario, type UsuarioFormValores } from '../../utils/gestionar_usuarios/usuarioForm';

/** CU01 3b: actualizar datos y roles. */
export default function UsuarioEditarPage() {
  const { id } = useParams(); // viene de la ruta /usuarios/:id/editar
  const idUsuario = Number(id);
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState<UsuarioDetalle | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    consultarUsuario(idUsuario)
      .then(setUsuario)
      .catch((err) => setError(obtenerError(err).mensaje));
  }, [idUsuario]);

  async function guardar(valores: UsuarioFormValores) {
    await actualizarUsuario(idUsuario, construirRequest(valores));
    navigate(`/usuarios/${idUsuario}`, { state: { mensaje: 'Usuario actualizado correctamente' } });
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!usuario) return <CircularProgress />;

  return (
    <>
      <PageHeader title="Editar usuario" />
      <UsuarioForm
        valoresIniciales={valoresDesdeUsuario(usuario)}
        pedirContrasena={false}
        textoBoton="Guardar cambios"
        onGuardar={guardar}
        onCancelar={() => navigate(`/usuarios/${idUsuario}`)}
      />
    </>
  );
}
