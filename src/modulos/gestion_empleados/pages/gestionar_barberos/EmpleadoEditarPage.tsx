import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import PageHeader from '../../../../shared/components/PageHeader';
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
      <PageHeader title="Editar empleado" action={<EstadoEmpleadoChip estado={empleado.estado} />} />
      <EmpleadoForm
        valoresIniciales={valoresDesdeEmpleado(empleado)}
        registrar={false}
        serviciosAsignados={empleado.servicios}
        onGuardar={guardar}
        onCancelar={() => navigate('/empleados')}
      />
    </>
  );
}
