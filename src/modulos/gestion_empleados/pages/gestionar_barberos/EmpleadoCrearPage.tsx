import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { registrarEmpleado } from '../../api/gestionar_barberos/empleadosApi';
import EmpleadoForm from '../../components/gestionar_barberos/EmpleadoForm';
import {
  construirRegistrar,
  VALORES_VACIOS,
  type EmpleadoFormValores,
} from '../../utils/gestionar_barberos/empleadoForm';

/** CU17 paso 2: registrar barbero/empleado (cuenta + datos laborales en un solo formulario). */
export default function EmpleadoCrearPage() {
  const navigate = useNavigate();

  async function guardar(valores: EmpleadoFormValores) {
    const respuesta = await registrarEmpleado(construirRegistrar(valores));
    navigate('/empleados', { state: { mensaje: respuesta.mensaje } });
  }

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Registrar empleado
      </Typography>
      <EmpleadoForm
        valoresIniciales={VALORES_VACIOS}
        registrar
        onGuardar={guardar}
        onCancelar={() => navigate('/empleados')}
      />
    </>
  );
}
