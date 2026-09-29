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
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type FormEvent } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { obtenerOpcionesFormulario } from '../../api/gestionar_barberos/barberosApi';
import { TIPOS_CONTRATO } from '../../constants/gestionar_barberos';
import type { OpcionesFormularioBarbero, TipoContrato } from '../../types/gestionar_barberos';
import {
  erroresDesdeBackend,
  formatearTurno,
  validarBarbero,
  type BarberoFormValores,
  type ErroresFormulario,
} from '../../utils/gestionar_barberos/barberoForm';

interface Props {
  valoresIniciales: BarberoFormValores;
  /** true al registrar (se pide la contraseña inicial); false al modificar. */
  esRegistro: boolean;
  textoBoton: string;
  onGuardar: (valores: BarberoFormValores) => Promise<void>;
  onCancelar: () => void;
}

/** CU16 pasos 4–5: formulario compartido entre "Registrar barbero" y "Modificar" (3a). */
export default function BarberoForm({ valoresIniciales, esRegistro, textoBoton, onGuardar, onCancelar }: Props) {
  const [valores, setValores] = useState<BarberoFormValores>(valoresIniciales);
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [opciones, setOpciones] = useState<OpcionesFormularioBarbero | null>(null);

  // Paso 4: turnos, servicios habilitados y tipos de contrato vienen del backend.
  useEffect(() => {
    obtenerOpcionesFormulario()
      .then(setOpciones)
      .catch((err) => setErrorGeneral(obtenerError(err).mensaje));
  }, []);

  /** Actualiza un campo y borra su error. */
  function cambiar<K extends keyof BarberoFormValores>(campo: K, valor: BarberoFormValores[K]) {
    setValores((anteriores) => ({ ...anteriores, [campo]: valor }));
    setErrores((anteriores) => ({ ...anteriores, [campo]: undefined }));
  }

  function alternarServicio(idServicio: number) {
    const nuevos = valores.servicioIds.includes(idServicio)
      ? valores.servicioIds.filter((id) => id !== idServicio)
      : [...valores.servicioIds, idServicio];
    cambiar('servicioIds', nuevos);
  }

  // Paso 5: el administrador presiona "Guardar".
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorGeneral('');

    // Paso 6: primero validamos aquí para no llamar al backend con datos que sabemos que fallan (6a).
    const { mensaje, errores: erroresLocales } = validarBarbero(valores, esRegistro);
    setErrores(erroresLocales);
    if (mensaje) {
      setErrorGeneral(mensaje);
      return;
    }

    setEnviando(true);
    try {
      await onGuardar(valores);
    } catch (err) {
      // 6a desde el backend (por ejemplo, correo ya registrado). El formulario conserva lo escrito (vuelve al paso 4).
      const { mensaje: mensajeBackend, campos } = obtenerError(err);
      setErrorGeneral(mensajeBackend);
      setErrores(erroresDesdeBackend(campos));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Paper component="form" onSubmit={handleSubmit} noValidate sx={{ p: 3, maxWidth: 800 }}>
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
          slotProps={{ htmlInput: { maxLength: 80 } }}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Correo"
            type="email"
            required
            value={valores.correo}
            onChange={(e) => cambiar('correo', e.target.value)}
            error={!!errores.correo}
            helperText={errores.correo ?? 'Con este correo inicia sesión'}
            sx={{ flex: 1 }}
            slotProps={{ htmlInput: { maxLength: 100 } }}
          />
          <TextField
            label="Teléfono"
            required
            value={valores.telefono}
            onChange={(e) => cambiar('telefono', e.target.value)}
            error={!!errores.telefono}
            helperText={errores.telefono}
            sx={{ flex: 1 }}
            slotProps={{ htmlInput: { inputMode: 'tel', maxLength: 15 } }}
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {esRegistro && (
            <TextField
              label="Contraseña inicial"
              type="password"
              required
              autoComplete="new-password"
              value={valores.contrasena}
              onChange={(e) => cambiar('contrasena', e.target.value)}
              error={!!errores.contrasena}
              helperText={errores.contrasena ?? 'El barbero la usa para ver su agenda y comisiones'}
              sx={{ flex: 1 }}
            />
          )}
          <TextField
            label="Fecha de nacimiento"
            type="date"
            value={valores.fechaNacimiento}
            onChange={(e) => cambiar('fechaNacimiento', e.target.value)}
            error={!!errores.fechaNacimiento}
            helperText={errores.fechaNacimiento ?? 'Opcional'}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ flex: 1 }}
          />
        </Stack>

        <Divider />
        <Typography variant="h6">Datos de trabajo</Typography>
        {!opciones && !errorGeneral && <LinearProgress />}
        {/* Mientras llegan las opciones, los selectores quedan vacíos (MUI avisa si el valor no está en la lista). */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            select
            label="Turno"
            required
            value={opciones ? valores.turnoId : ''}
            onChange={(e) => {
              const valor = e.target.value as number | '';
              cambiar('turnoId', valor === '' ? '' : Number(valor));
            }}
            error={!!errores.turnoId}
            helperText={errores.turnoId}
            sx={{ flex: 1 }}
          >
            {(opciones?.turnos ?? []).map((t) => (
              <MenuItem key={t.idTurno} value={t.idTurno}>
                {formatearTurno(t)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Tipo de contrato"
            required
            value={opciones ? valores.tipoContrato : ''}
            onChange={(e) => cambiar('tipoContrato', e.target.value as TipoContrato)}
            error={!!errores.tipoContrato}
            helperText={errores.tipoContrato}
            sx={{ flex: 1 }}
          >
            {(opciones?.tiposContrato ?? []).map((t) => (
              <MenuItem key={t} value={t}>
                {TIPOS_CONTRATO[t]}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <TextField
          label="Especialidad"
          value={valores.especialidad}
          onChange={(e) => cambiar('especialidad', e.target.value)}
          error={!!errores.especialidad}
          helperText={errores.especialidad ?? 'Opcional. Ej: "Degradados y diseños"'}
          slotProps={{ htmlInput: { maxLength: 80 } }}
        />

        <Divider />
        {/* Paso 5: marca las especialidades técnicas autorizadas (solo servicios habilitados del catálogo). */}
        <FormControl error={!!errores.servicioIds} required>
          <FormLabel>Especialidades técnicas autorizadas</FormLabel>
          <FormGroup row>
            {(opciones?.servicios ?? []).map((s) => (
              <FormControlLabel
                key={s.idServicio}
                label={s.nombre}
                sx={{ width: { xs: '100%', sm: '48%' }, mr: 0 }}
                control={
                  <Checkbox
                    checked={valores.servicioIds.includes(s.idServicio)}
                    onChange={() => alternarServicio(s.idServicio)}
                  />
                }
              />
            ))}
          </FormGroup>
          <FormHelperText>{errores.servicioIds ?? 'Servicios que este barbero está autorizado a realizar'}</FormHelperText>
        </FormControl>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1 }}>
          <Button onClick={onCancelar} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={enviando || !opciones}>
            {enviando ? 'Guardando...' : textoBoton}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
