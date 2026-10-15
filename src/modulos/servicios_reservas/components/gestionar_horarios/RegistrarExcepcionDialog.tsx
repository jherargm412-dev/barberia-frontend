import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { registrarExcepcion } from '../../api/gestionar_horarios/horariosApi';
import { TIPOS_EXCEPCION } from '../../constants/gestionar_horarios';
import type { CitaAfectada, TipoExcepcion } from '../../types/gestionar_horarios';
import { hoyIso, obtenerCitasAfectadas } from '../../utils/gestionar_horarios/horarioForm';
import CitasAfectadasAlert from './CitasAfectadasAlert';

interface Props {
  /** Barbero al que se le registra la excepción. La página monta el diálogo solo mientras está abierto. */
  idEmpleado: number;
  nombre: string;
  onCerrar: () => void;
  onGuardado: (mensaje: string) => void;
}

const MAX_MOTIVO = 200;

/**
 * CU09 4b: registrar vacaciones, permiso, día libre u horario especial. Las validaciones
 * (4c fechas, 4d cruce, 4e horas, 4f citas) las hace el backend y aquí se muestra su mensaje.
 */
export default function RegistrarExcepcionDialog({ idEmpleado, nombre, onCerrar, onGuardado }: Props) {
  const [tipo, setTipo] = useState<TipoExcepcion | ''>('');
  const [motivo, setMotivo] = useState('');
  const [horaEntrada, setHoraEntrada] = useState('');
  const [horaSalida, setHoraSalida] = useState('');

  const [error, setError] = useState('');
  const [campos, setCampos] = useState<Record<string, string>>({});
  const [citas, setCitas] = useState<CitaAfectada[]>([]);
  const [guardando, setGuardando] = useState(false);

  const esHorarioEspecial = tipo === 'HORARIO_ESPECIAL';

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Las fechas se leen directamente de los campos al guardar (ver comentario en el <form>).
    const formulario = new FormData(e.currentTarget);
    const fechaInicio = String(formulario.get('fechaInicio') ?? '');
    const fechaFin = String(formulario.get('fechaFin') ?? '');
    setGuardando(true);
    setError('');
    setCampos({});
    setCitas([]);
    try {
      const respuesta = await registrarExcepcion(idEmpleado, {
        fechaInicio: fechaInicio || null,
        fechaFin: fechaFin || null,
        tipo: tipo || null,
        motivo: motivo.trim() || null,
        // Las horas solo se envían en horario especial; en los demás tipos no aplican.
        horaEntrada: esHorarioEspecial ? horaEntrada || null : null,
        horaSalida: esHorarioEspecial ? horaSalida || null : null,
      });
      onGuardado(respuesta.mensaje); // "Excepción registrada correctamente"
    } catch (err) {
      // Regresa al formulario (4c–4f) mostrando el mensaje del backend.
      const { mensaje, campos: errores } = obtenerError(err);
      setError(mensaje);
      setCampos(errores);
      setCitas(obtenerCitasAfectadas(err));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open onClose={onCerrar} fullWidth maxWidth="md">
      {/* noValidate: valida el backend, con los mensajes exactos del CU (4c–4f).
          Las fechas empiezan con la de hoy ya cargada: en Safari un campo de fecha vacío muestra
          la fecha de hoy solo como ejemplo, y si se cambia únicamente el día el valor queda vacío. */}
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>Registrar excepción — {nombre}</DialogTitle>
        <DialogContent dividers>
          {/* 4f: si hay citas en esas fechas se muestran para reprogramarlas antes. */}
          {citas.length > 0 ? (
            <CitasAfectadasAlert mensaje={error} citas={citas} />
          ) : (
            error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )
          )}
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                type="date"
                label="Fecha de inicio"
                name="fechaInicio"
                defaultValue={hoyIso()}
                error={Boolean(campos.fechaInicio)}
                helperText={campos.fechaInicio}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                type="date"
                label="Fecha de fin"
                name="fechaFin"
                defaultValue={hoyIso()}
                error={Boolean(campos.fechaFin)}
                helperText={campos.fechaFin}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
            <TextField
              select
              label="Tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoExcepcion)}
              error={Boolean(campos.tipo)}
              helperText={campos.tipo}
            >
              {TIPOS_EXCEPCION.map((t) => (
                <MenuItem key={t.valor} value={t.valor}>
                  {t.etiqueta}
                </MenuItem>
              ))}
            </TextField>
            {/* Solo el horario especial pide horas de entrada y salida. */}
            {esHorarioEspecial && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  type="time"
                  label="Hora de entrada"
                  value={horaEntrada}
                  onChange={(e) => setHoraEntrada(e.target.value)}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  type="time"
                  label="Hora de salida"
                  value={horaSalida}
                  onChange={(e) => setHoraSalida(e.target.value)}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Stack>
            )}
            <TextField
              label="Motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              error={Boolean(campos.motivo)}
              helperText={campos.motivo ?? `Opcional (${motivo.length}/${MAX_MOTIVO})`}
              multiline
              minRows={2}
              slotProps={{ htmlInput: { maxLength: MAX_MOTIVO } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCerrar} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
