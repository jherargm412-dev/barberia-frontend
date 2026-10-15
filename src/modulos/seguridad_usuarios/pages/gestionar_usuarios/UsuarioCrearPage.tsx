import PageHeader from '../../../../shared/components/PageHeader';

import { useNavigate } from 'react-router-dom';
import { registrarUsuario } from '../../api/gestionar_usuarios/usuariosApi';
import UsuarioForm from '../../components/gestionar_usuarios/UsuarioForm';
import { construirRequest, VALORES_VACIOS, type UsuarioFormValores } from '../../utils/gestionar_usuarios/usuarioForm';

/** CU01 pasos 3–7: registrar usuario. */
export default function UsuarioCrearPage() {
  const navigate = useNavigate();

  async function guardar(valores: UsuarioFormValores) {
    const respuesta = await registrarUsuario({
      ...construirRequest(valores),
      contrasena: valores.enviarInvitacion ? null : valores.contrasena,
      enviarInvitacion: valores.enviarInvitacion,
    });
    // Vamos al detalle y le pasamos el mensaje de éxito del backend.
    navigate(`/usuarios/${respuesta.usuario.idUsuario}`, {
      state: { mensaje: respuesta.mensaje },
    });
  }

  return (
    <>
      <PageHeader title="Registrar usuario" />
      <UsuarioForm
        valoresIniciales={VALORES_VACIOS}
        pedirContrasena
        textoBoton="Registrar"
        onGuardar={guardar}
        onCancelar={() => navigate('/usuarios')}
      />
    </>
  );
}
