import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { TIPOS_CONTRATO } from '../../constants/gestionar_usuarios';
import type { PerfilEmpleado } from '../../types/configurar_perfil';
import { formatearHora } from '../../utils/configurar_perfil/perfilForm';

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <Typography variant="body2" color="text.secondary">
        {etiqueta}
      </Typography>
      <Typography>{valor || '—'}</Typography>
    </div>
  );
}

/** CU04 paso 1: datos laborales del empleado, solo lectura (los gestiona el Administrador). */
export default function InformacionLaboral({ empleado }: { empleado: PerfilEmpleado }) {
  const contrato = TIPOS_CONTRATO.find((t) => t.valor === empleado.tipoContrato)?.etiqueta ?? empleado.tipoContrato;
  const turno = empleado.turno
    ? `${empleado.turno} (${formatearHora(empleado.horaEntrada)} - ${formatearHora(empleado.horaSalida)})`
    : '';

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6">Información laboral</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Solo lectura. Si algún dato es incorrecto, comuníquelo al administrador.
      </Typography>
      <Stack spacing={1.5}>
        <Dato etiqueta="Especialidad" valor={empleado.especialidad ?? ''} />
        <Dato etiqueta="Tipo de contrato" valor={contrato} />
        <Dato etiqueta="Turno" valor={turno} />
      </Stack>
    </Paper>
  );
}
