import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type FormEvent } from 'react';
import RequisitosContrasena from '../../../../shared/components/RequisitosContrasena';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { listarTurnos } from '../../api/gestionar_barberos/empleadosApi';
import { ROLES_ALTA, TIPOS_CONTRATO } from '../../constants/gestionar_barberos';
import type { TipoContrato, Turno } from '../../types/gestionar_barberos';
import {
  formatearHora,
  validarEmpleado,
  type EmpleadoFormValores,
  type ErroresFormulario,
} from '../../utils/gestionar_barberos/empleadoForm';

interface Props {
  valoresIniciales: EmpleadoFormValores;
  /** true = "Registrar" (pide contraseña y rol); false = "Editar". */
  registrar: boolean;
  onGuardar: (valores: EmpleadoFormValores) => Promise<void>;
  onCancelar: () => void;
}

/** Formulario integrado de CU17: datos de la cuenta + datos laborales. */
export default function EmpleadoForm({ valoresIniciales, registrar, onGuardar, onCancelar }: Props) {
  const [valores, setValores] = useState<EmpleadoFormValores>(valoresIniciales);
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [errorTurnos, setErrorTurnos] = useState('');

  useEffect(() => {
    listarTurnos()
      .then(setTurnos)
      .catch((err) => setErrorTurnos(obtenerError(err).mensaje));
  }, []);

  function cambiar<K extends keyof EmpleadoFormValores>(campo: K, valor: EmpleadoFormValores[K]) {
    setValores((anteriores) => ({ ...anteriores, [campo]: valor }));
    setErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorGeneral('');
    const erroresLocales = validarEmpleado(valores, registrar);
    setErrores(erroresLocales);
    if (Object.keys(erroresLocales).length > 0) {
      setErrorGeneral('Revise los campos marcados');
      return;
    }

    setEnviando(true);
    try {
      await onGuardar(valores);
    } catch (err) {
      // P. ej. "El correo ya está registrado". El formulario conserva lo escrito.
      const { mensaje, campos } = obtenerError(err);
      setErrorGeneral(mensaje);
      setErrores(campos as ErroresFormulario);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Paper component="form" onSubmit={handleSubmit} noValidate sx={{ p: { xs: 2, sm: 3 }, maxWidth: 760 }}>
      <Stack spacing={2}>
        {errorGeneral && <Alert severity="error">{errorGeneral}</Alert>}

        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Datos de la cuenta
        </Typography>
        <TextField
          label="Nombre completo"
          required
          value={valores.nombre}
          onChange={(e) => cambiar('nombre', e.target.value)}
          error={!!errores.nombre}
          helperText={errores.nombre}
          slotProps={{ htmlInput: { maxLength: 80 } }}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Correo"
            required
            type="email"
            value={valores.correo}
            onChange={(e) => cambiar('correo', e.target.value)}
            error={!!errores.correo}
            helperText={errores.correo ?? (registrar ? 'Con este correo iniciará sesión' : undefined)}
            sx={{ flex: 1 }}
            slotProps={{ htmlInput: { maxLength: 100 } }}
          />
          <TextField
            label="Teléfono"
            value={valores.telefono}
            onChange={(e) => cambiar('telefono', e.target.value)}
            error={!!errores.telefono}
            helperText={errores.telefono ?? 'Opcional'}
            sx={{ flex: 1 }}
            slotProps={{ htmlInput: { maxLength: 15, inputMode: 'tel' } }}
          />
        </Stack>
        {registrar && (
          <FormControlLabel
            label="Enviar invitación por correo (el empleado elige su propia contraseña)"
            control={
              <Checkbox
                checked={valores.enviarInvitacion}
                onChange={(e) => cambiar('enviarInvitacion', e.target.checked)}
              />
            }
          />
        )}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {registrar && !valores.enviarInvitacion && (
            <Box sx={{ flex: 1 }}>
              <TextField
                label="Contraseña inicial"
                required
                fullWidth
                type="password"
                autoComplete="new-password"
                value={valores.contrasena}
                onChange={(e) => cambiar('contrasena', e.target.value)}
                error={!!errores.contrasena}
                helperText={errores.contrasena ?? 'El empleado podrá cambiarla en "Mi perfil"'}
              />
              <RequisitosContrasena contrasena={valores.contrasena} />
            </Box>
          )}
          <TextField
            label="Fecha de nacimiento"
            type="date"
            value={valores.fechaNacimiento}
            onChange={(e) => cambiar('fechaNacimiento', e.target.value)}
            error={!!errores.fechaNacimiento}
            helperText={errores.fechaNacimiento ?? 'Opcional'}
            sx={{ flex: 1 }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>

        <Divider />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Datos laborales
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {registrar ? (
            <TextField
              select
              label="Rol"
              required
              value={valores.rol}
              onChange={(e) => cambiar('rol', e.target.value)}
              error={!!errores.rol}
              helperText={errores.rol}
              sx={{ flex: 1 }}
            >
              {ROLES_ALTA.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            // Cambiar roles es parte de CU01 (Usuarios), no de este CU.
            <TextField label="Rol" value={valores.rol} disabled helperText="Se cambia en Usuarios" sx={{ flex: 1 }} />
          )}
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
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Especialidad"
            value={valores.especialidad}
            onChange={(e) => cambiar('especialidad', e.target.value)}
            error={!!errores.especialidad}
            helperText={errores.especialidad ?? 'Opcional. Ej: Degradados, barba clásica'}
            sx={{ flex: 1 }}
            slotProps={{ htmlInput: { maxLength: 80 } }}
          />
          <TextField
            select
            label="Turno"
            value={valores.turnoId}
            onChange={(e) => cambiar('turnoId', e.target.value === '' ? '' : Number(e.target.value))}
            error={!!errores.turnoId}
            helperText={errores.turnoId ?? 'Opcional'}
            sx={{ flex: 1 }}
          >
            <MenuItem value="">Sin turno</MenuItem>
            {turnos.map((t) => (
              <MenuItem key={t.idTurno} value={t.idTurno}>
                {t.nombre} ({formatearHora(t.horaEntrada)} - {formatearHora(t.horaSalida)})
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        {errorTurnos && (
          <Alert severity="warning">
            No se pudieron cargar los turnos ({errorTurnos}). Si guarda, el turno actual se conserva.
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1 }}>
          <Button onClick={onCancelar} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={enviando}>
            {enviando ? 'Guardando...' : registrar ? 'Registrar' : 'Guardar'}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
