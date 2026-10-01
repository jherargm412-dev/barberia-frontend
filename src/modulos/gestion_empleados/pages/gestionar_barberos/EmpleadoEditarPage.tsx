import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { actualizarEmpleado, consultarEmpleado } from '../../api/gestionar_barberos/empleadosApi';
import EmpleadoForm from '../../components/gestionar_barberos/EmpleadoForm';
import EstadoEmpleadoChip from '../../components/gestionar_barberos/EstadoEmpleadoChip';
import type { Empleado } from '../../types/gestionar_barberos';
import {
  construirActualizar,
  valoresDesdeEmpleado,
  type EmpleadoFormValores,
} from '../../utils/gestionar_barberos/empleadoForm';

/** CU17 paso 3: editar datos de acceso e información laboral. */
export default function EmpleadoEditarPage() {
  const { id } = useParams(); // viene de la ruta /empleados/:id/editar
  const idEmpleado = Number(id);
  const navigate = useNavigate();

  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    consultarEmpleado(idEmpleado)
      .then(setEmpleado)
      .catch((err) => setError(obtenerError(err).mensaje));
  }, [idEmpleado]);

  async function guardar(valores: EmpleadoFormValores) {
    const respuesta = await actualizarEmpleado(idEmpleado, construirActualizar(valores));
    navigate('/empleados', { state: { mensaje: respuesta.mensaje } });
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!empleado) return <CircularProgress />;

  return (
    <>
      <Typography variant="h5" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        Editar empleado <EstadoEmpleadoChip estado={empleado.estado} />
      </Typography>
      {/* Vista rápida de servicios asignados (extra del CU); se editan desde el listado. */}
      {empleado.servicios.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          {empleado.servicios.map((s) => (
            <Chip key={s.idServicio} label={s.nombre} size="small" variant="outlined" />
          ))}
        </Stack>
      )}
      <EmpleadoForm
        valoresIniciales={valoresDesdeEmpleado(empleado)}
        registrar={false}
        onGuardar={guardar}
        onCancelar={() => navigate('/empleados')}
      />
    </>
  );
}
