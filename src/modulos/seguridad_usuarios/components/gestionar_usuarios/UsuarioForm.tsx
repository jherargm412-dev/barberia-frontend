import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type FormEvent } from 'react';
import RequisitosContrasena from '../../../../shared/components/RequisitosContrasena';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { listarRoles } from '../../api/gestionar_usuarios/rolesApi';
import { TIPOS_CONTRATO, TURNOS } from '../../constants/gestionar_usuarios';
import type { RolResumen, TipoContrato } from '../../types/gestionar_usuarios';
import {
  esEmpleado,
  mapearErroresBackend,
  validarUsuario,
  type ErroresFormulario,
  type UsuarioFormValores,
} from '../../utils/gestionar_usuarios/usuarioForm';

interface Props {
  valoresIniciales: UsuarioFormValores;
  /** true al crear (se pide contraseña); false al editar. */
  pedirContrasena: boolean;
  textoBoton: string;
  onGuardar: (valores: UsuarioFormValores) => Promise<void>;
  onCancelar: () => void;
}

/** Formulario compartido entre "Registrar usuario" y "Editar usuario". */
export default function UsuarioForm({
  valoresIniciales,
  pedirContrasena,
  textoBoton,
  onGuardar,
  onCancelar,
}: Props) {
  const [valores, setValores] = useState<UsuarioFormValores>(valoresIniciales);
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [roles, setRoles] = useState<RolResumen[]>([]);

  // Cargar los roles disponibles una sola vez.
  useEffect(() => {
    listarRoles()
      .then(setRoles)
      .catch((err) => setErrorGeneral(obtenerError(err).mensaje));
  }, []);

  /** Actualiza un campo y borra su error. */
  function cambiar<K extends keyof UsuarioFormValores>(campo: K, valor: UsuarioFormValores[K]) {
    setValores((anteriores) => ({ ...anteriores, [campo]: valor }));
    setErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
  }

  function alternarRol(nombreRol: string) {
    const nuevos = valores.roles.includes(nombreRol)
      ? valores.roles.filter((r) => r !== nombreRol)
      : [...valores.roles, nombreRol];
    cambiar('roles', nuevos);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorGeneral('');

    const erroresLocales = validarUsuario(valores, pedirContrasena);
    setErrores(erroresLocales);
    if (Object.keys(erroresLocales).length > 0) return;

    setEnviando(true);
    try {
      await onGuardar(valores);
    } catch (err) {
      // Errores del backend: mensaje general + errores por campo si los hay.
      const { mensaje, campos } = obtenerError(err);
      setErrorGeneral(mensaje);
      setErrores(mapearErroresBackend(campos));
    } finally {
      setEnviando(false);
    }
  }

  const mostrarEmpleado = esEmpleado(valores.roles);

  // Roles que el usuario ya tenía y que ya no vienen en la lista de activos (desactivados en CU03).
  // Se calculan desde los valores iniciales para que la casilla no desaparezca al desmarcarla.
  const rolesInactivos =
    roles.length === 0 ? [] : valoresIniciales.roles.filter((nombre) => !roles.some((r) => r.nombre === nombre));

  return (
    <Paper component="form" onSubmit={handleSubmit} noValidate sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={2}>
        {errorGeneral && <Alert severity="error">{errorGeneral}</Alert>}

        <Typography variant="h6">Datos personales</Typography>
        <TextField
          label="Nombre"
          required
          value={valores.nombre}
          onChange={(e) => cambiar('nombre', e.target.value)}
          error={!!errores.nombre}
          helperText={errores.nombre}
        />
        <TextField
          label="Correo"
          type="email"
          required
          value={valores.correo}
          onChange={(e) => cambiar('correo', e.target.value)}
          error={!!errores.correo}
          helperText={errores.correo}
        />
        {pedirContrasena && (
          <FormControlLabel
            label="Enviar invitación por correo (el usuario elige su propia contraseña)"
            control={
              <Checkbox
                checked={valores.enviarInvitacion}
                onChange={(e) => cambiar('enviarInvitacion', e.target.checked)}
              />
            }
          />
        )}
        {pedirContrasena && !valores.enviarInvitacion && (
          <Box>
            <TextField
              label="Contraseña"
              type="password"
              required
              fullWidth
              autoComplete="new-password"
              value={valores.contrasena}
              onChange={(e) => cambiar('contrasena', e.target.value)}
              error={!!errores.contrasena}
              helperText={errores.contrasena}
            />
            <RequisitosContrasena contrasena={valores.contrasena} />
          </Box>
        )}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Teléfono"
            value={valores.telefono}
            onChange={(e) => cambiar('telefono', e.target.value)}
            error={!!errores.telefono}
            helperText={errores.telefono}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Fecha de nacimiento"
            type="date"
            value={valores.fechaNacimiento}
            onChange={(e) => cambiar('fechaNacimiento', e.target.value)}
            error={!!errores.fechaNacimiento}
            helperText={errores.fechaNacimiento}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ flex: 1 }}
          />
        </Stack>

        <Divider />

        <FormControl error={!!errores.roles}>
          <FormLabel>Roles *</FormLabel>
          <FormGroup row>
            {roles.map((rol) => (
              <FormControlLabel
                key={rol.idRol}
                label={rol.nombre}
                control={
                  <Checkbox
                    checked={valores.roles.includes(rol.nombre)}
                    onChange={() => alternarRol(rol.nombre)}
                  />
                }
              />
            ))}
            {rolesInactivos.map((nombre) => (
              <FormControlLabel
                key={nombre}
                label={`${nombre} (inactivo)`}
                control={
                  <Checkbox checked={valores.roles.includes(nombre)} onChange={() => alternarRol(nombre)} />
                }
              />
            ))}
          </FormGroup>
          {rolesInactivos.length > 0 && (
            <FormHelperText>
              Un rol inactivo no otorga permisos. Se puede conservar o quitar, pero no volver a asignar una vez
              guardado.
            </FormHelperText>
          )}
          {errores.roles && <FormHelperText>{errores.roles}</FormHelperText>}
        </FormControl>

        {/* Solo se muestra si algún rol es de empleado (Administrador, Recepcionista, Barbero). */}
        {mostrarEmpleado && (
          <>
            <Divider />
            <Typography variant="h6">Datos de empleado</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Tipo de contrato"
                required
                value={valores.tipoContrato}
                onChange={(e) => cambiar('tipoContrato', e.target.value as TipoContrato)}
                error={!!errores.tipoContrato}
                helperText={errores.tipoContrato}
                sx={{ flex: 1 }}
              >
                {TIPOS_CONTRATO.map((t) => (
                  <MenuItem key={t.valor} value={t.valor}>
                    {t.etiqueta}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Turno"
                value={valores.turnoId}
                onChange={(e) => {
                  const valor = e.target.value as number | '';
                  cambiar('turnoId', valor === '' ? '' : Number(valor));
                }}
                error={!!errores.turnoId}
                helperText={errores.turnoId}
                sx={{ flex: 1 }}
              >
                <MenuItem value="">Sin turno</MenuItem>
                {TURNOS.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField
              label="Especialidad"
              value={valores.especialidad}
              onChange={(e) => cambiar('especialidad', e.target.value)}
              error={!!errores.especialidad}
              helperText={errores.especialidad}
            />
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1 }}>
          <Button onClick={onCancelar} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={enviando}>
            {enviando ? 'Guardando...' : textoBoton}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
