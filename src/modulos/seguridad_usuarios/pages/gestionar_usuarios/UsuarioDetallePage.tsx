import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { useAuth } from '../../context/iniciar_sesion/useAuth';
import {
  activarUsuario,
  consultarUsuario,
  deshabilitarUsuario,
  reenviarInvitacion,
} from '../../api/gestionar_usuarios/usuariosApi';
import CambiarContrasenaDialog from '../../components/gestionar_usuarios/CambiarContrasenaDialog';
import EstadoChip from '../../components/gestionar_usuarios/EstadoChip';
import { PERMISOS, TIPOS_CONTRATO } from '../../constants/gestionar_usuarios';
import type { UsuarioDetalle } from '../../types/gestionar_usuarios';
import { formatearFechaHora } from '../../utils/consultar_bitacora/formatoBitacora';

/** Una fila "Etiqueta: valor" del detalle. */
function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Typography color="text.secondary" sx={{ width: 180, flexShrink: 0 }}>
        {etiqueta}
      </Typography>
      <Box>{children || '—'}</Box>
    </Box>
  );
}

/** CU01 3a/3b/3c: consultar usuario, restablecer contraseña, deshabilitar o activar. */
export default function UsuarioDetallePage() {
  const { id } = useParams();
  const idUsuario = Number(id);
  const navigate = useNavigate();
  const ubicacion = useLocation();
  const { tienePermiso } = useAuth();

  const [usuario, setUsuario] = useState<UsuarioDetalle | null>(null);
  const [error, setError] = useState('');
  // Mensaje de éxito: puede venir de la página anterior (crear/editar) o de una acción aquí.
  const [mensaje, setMensaje] = useState((ubicacion.state as { mensaje?: string } | null)?.mensaje ?? '');
  const [confirmando, setConfirmando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [dialogoContrasena, setDialogoContrasena] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  useEffect(() => {
    consultarUsuario(idUsuario)
      .then(setUsuario)
      .catch((err) => setError(obtenerError(err).mensaje));
  }, [idUsuario]);

  if (!usuario) {
    return error ? <Alert severity="error">{error}</Alert> : <CircularProgress />;
  }

  const estaActivo = usuario.estado === 'ACTIVO';

  async function cambiarEstado() {
    setProcesando(true);
    setError('');
    try {
      const actualizado = estaActivo
        ? await deshabilitarUsuario(idUsuario)
        : await activarUsuario(idUsuario);
      setUsuario(actualizado);
      setMensaje(estaActivo ? 'Usuario deshabilitado' : 'Usuario activado');
    } catch (err) {
      // Ej: "Un administrador no puede deshabilitarse a sí mismo"
      setError(obtenerError(err).mensaje);
    } finally {
      setProcesando(false);
      setConfirmando(false);
    }
  }

  async function reenviar() {
    setReenviando(true);
    setError('');
    setMensaje('');
    try {
      setUsuario(await reenviarInvitacion(idUsuario));
      setMensaje('Invitación reenviada. El enlace anterior ya no sirve');
    } catch (err) {
      setError(obtenerError(err).mensaje);
    } finally {
      setReenviando(false);
    }
  }

  const tipoContrato = TIPOS_CONTRATO.find((t) => t.valor === usuario.empleado?.tipoContrato)?.etiqueta;

  return (
    <>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/usuarios')} sx={{ mb: 2 }}>
        Volver al listado
      </Button>

      <Stack spacing={2} sx={{ mb: 2 }}>
        {mensaje && (
          <Alert severity="success" onClose={() => setMensaje('')}>
            {mensaje}
          </Alert>
        )}
        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {usuario.invitacion && (
          <Alert
            severity={usuario.invitacion.vencida ? 'warning' : 'info'}
            action={
              <Button color="inherit" size="small" onClick={reenviar} disabled={reenviando}>
                {reenviando ? 'Enviando...' : 'Reenviar invitación'}
              </Button>
            }
          >
            {usuario.invitacion.vencida
              ? 'La invitación por correo venció sin que el usuario eligiera su contraseña.'
              : `Invitación pendiente: el usuario todavía no eligió su contraseña (el enlace vence el ${formatearFechaHora(usuario.invitacion.expiraEn)}).`}
          </Alert>
        )}
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="h5">{usuario.nombre}</Typography>
            <Typography color="text.secondary">{usuario.correo}</Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {tienePermiso(PERMISOS.ASIGNAR_ROL) && (
              <Button variant="outlined" onClick={() => navigate(`/usuarios/${idUsuario}/editar`)}>
                Editar
              </Button>
            )}
            <Button variant="outlined" onClick={() => setDialogoContrasena(true)}>
              Restablecer contraseña
            </Button>
            <Button
              variant="contained"
              color={estaActivo ? 'error' : 'success'}
              onClick={() => setConfirmando(true)}
            >
              {estaActivo ? 'Deshabilitar' : 'Activar'}
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={1.5}>
          <Dato etiqueta="Estado">
            <EstadoChip estado={usuario.estado} />
          </Dato>
          <Dato etiqueta="Roles">
            <Stack direction="row" spacing={0.5}>
              {usuario.roles.map((r) => (
                <Chip key={r.idRol} label={r.nombre} size="small" variant="outlined" />
              ))}
            </Stack>
          </Dato>
          <Dato etiqueta="Teléfono">{usuario.telefono}</Dato>
          <Dato etiqueta="Fecha de nacimiento">{usuario.fechaNacimiento}</Dato>
          <Dato etiqueta="Fecha de creación">
            {new Date(usuario.fechaCreacion).toLocaleString()}
          </Dato>

          {usuario.empleado && (
            <>
              <Divider />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Datos de empleado
              </Typography>
              <Dato etiqueta="Tipo de contrato">{tipoContrato}</Dato>
              <Dato etiqueta="Especialidad">{usuario.empleado.especialidad}</Dato>
              <Dato etiqueta="Turno">{usuario.empleado.turno?.nombre}</Dato>
            </>
          )}
        </Stack>
      </Paper>

      <ConfirmDialog
        abierto={confirmando}
        titulo={estaActivo ? 'Deshabilitar usuario' : 'Activar usuario'}
        mensaje={
          estaActivo
            ? `${usuario.nombre} ya no podrá iniciar sesión. ¿Deseas continuar?`
            : `${usuario.nombre} podrá volver a iniciar sesión. ¿Deseas continuar?`
        }
        textoConfirmar={estaActivo ? 'Deshabilitar' : 'Activar'}
        cargando={procesando}
        onConfirmar={cambiarEstado}
        onCancelar={() => setConfirmando(false)}
      />

      <CambiarContrasenaDialog
        abierto={dialogoContrasena}
        idUsuario={idUsuario}
        onCerrar={() => setDialogoContrasena(false)}
        onExito={() => {
          setDialogoContrasena(false);
          setMensaje('Contraseña restablecida correctamente');
          // Si tenía una invitación pendiente, el backend la anuló: recargamos para ocultar el aviso.
          consultarUsuario(idUsuario).then(setUsuario).catch(() => undefined);
        }}
      />
    </>
  );
}
