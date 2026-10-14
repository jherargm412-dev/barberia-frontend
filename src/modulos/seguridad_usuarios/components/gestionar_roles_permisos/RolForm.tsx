import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useEffect, useState, type FormEvent } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { listarPermisos } from '../../api/gestionar_roles_permisos/rolesPermisosApi';
import type { Permiso } from '../../types/gestionar_roles_permisos';
import {
  validarRol,
  type ErroresFormulario,
  type RolFormValores,
} from '../../utils/gestionar_roles_permisos/rolForm';
import PermisosSelector from './PermisosSelector';

interface Props {
  valoresIniciales: RolFormValores;
  textoBoton: string;
  onGuardar: (valores: RolFormValores) => Promise<void>;
  onCancelar: () => void;
  /** Rol del sistema: el nombre no se puede cambiar. */
  nombreBloqueado?: boolean;
  /** Rol Administrador: los permisos no se pueden cambiar. */
  permisosBloqueados?: boolean;
}

/** Formulario compartido entre "Nuevo rol" (vacío o clonado) y "Editar rol". */
export default function RolForm({
  valoresIniciales,
  textoBoton,
  onGuardar,
  onCancelar,
  nombreBloqueado = false,
  permisosBloqueados = false,
}: Props) {
  const [valores, setValores] = useState<RolFormValores>(valoresIniciales);
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [catalogo, setCatalogo] = useState<Permiso[] | null>(null);

  useEffect(() => {
    listarPermisos()
      .then(setCatalogo)
      .catch((err) => setErrorGeneral(obtenerError(err).mensaje));
  }, []);

  function cambiar<K extends keyof RolFormValores>(campo: K, valor: RolFormValores[K]) {
    setValores((anteriores) => ({ ...anteriores, [campo]: valor }));
    setErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorGeneral('');

    const { mensaje, errores: erroresLocales } = validarRol(valores);
    setErrores(erroresLocales);
    if (mensaje) {
      setErrorGeneral(mensaje);
      return;
    }

    setEnviando(true);
    try {
      await onGuardar(valores);
    } catch (err) {
      // Errores del backend, p. ej. "Ya existe un rol con ese nombre". El formulario conserva lo escrito.
      const { mensaje: mensajeBackend, campos } = obtenerError(err);
      setErrorGeneral(mensajeBackend);
      setErrores(campos as ErroresFormulario);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Paper component="form" onSubmit={handleSubmit} noValidate sx={{ p: 3, maxWidth: 960 }}>
      <Stack spacing={2}>
        {errorGeneral && <Alert severity="error">{errorGeneral}</Alert>}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Nombre"
            required
            value={valores.nombre}
            onChange={(e) => cambiar('nombre', e.target.value)}
            error={!!errores.nombre}
            helperText={errores.nombre ?? (nombreBloqueado ? 'Rol del sistema: el nombre no se puede cambiar' : undefined)}
            disabled={nombreBloqueado}
            sx={{ flex: 1 }}
            slotProps={{ htmlInput: { maxLength: 30 } }}
          />
          <TextField
            label="Descripción"
            value={valores.descripcion}
            onChange={(e) => cambiar('descripcion', e.target.value)}
            error={!!errores.descripcion}
            helperText={errores.descripcion ?? `${valores.descripcion.length}/150 (opcional)`}
            sx={{ flex: 2 }}
            slotProps={{ htmlInput: { maxLength: 150 } }}
          />
        </Stack>

        {permisosBloqueados && (
          <Alert severity="info">
            El rol Administrador conserva siempre todos sus permisos para que nadie pierda el acceso al sistema.
          </Alert>
        )}
        {errores.permisos && <Alert severity="error">Permisos no válidos: {errores.permisos}</Alert>}

        {catalogo ? (
          <PermisosSelector
            catalogo={catalogo}
            seleccionados={valores.permisos}
            onCambiar={(permisos) => cambiar('permisos', permisos)}
            soloLectura={permisosBloqueados}
          />
        ) : (
          !errorGeneral && <CircularProgress />
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1 }}>
          <Button onClick={onCancelar} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={enviando || !catalogo}>
            {enviando ? 'Guardando...' : textoBoton}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
