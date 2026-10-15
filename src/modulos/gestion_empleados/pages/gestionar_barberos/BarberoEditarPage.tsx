import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { consultarBarbero, modificarBarbero } from '../../api/gestionar_barberos/barberosApi';
import BarberoForm from '../../components/gestionar_barberos/BarberoForm';
import EstadoBarberoChip from '../../components/gestionar_barberos/EstadoBarberoChip';
import type { Barbero } from '../../types/gestionar_barberos';
import {
  construirRequest,
  valoresDesdeBarbero,
  type BarberoFormValores,
} from '../../utils/gestionar_barberos/barberoForm';

/** CU16 flujo 3a: modificar barbero (formulario con los datos cargados, retorna al paso 5). */
export default function BarberoEditarPage() {
  const { id } = useParams(); // viene de la ruta /barberos/:id/editar (idEmpleado)
  const idEmpleado = Number(id);
  const navigate = useNavigate();

  const [barbero, setBarbero] = useState<Barbero | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    consultarBarbero(idEmpleado)
      .then(setBarbero)
      .catch((err) => setError(obtenerError(err).mensaje));
  }, [idEmpleado]);

  async function guardar(valores: BarberoFormValores) {
    const respuesta = await modificarBarbero(idEmpleado, construirRequest(valores, false));
    navigate('/barberos', { state: { mensaje: respuesta.mensaje } });
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!barbero) return <CircularProgress />;

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        Modificar barbero <EstadoBarberoChip estado={barbero.estado} />
      </Typography>
      {/* El estado no se cambia aquí: se hace desde el listado (flujo 3b). La contraseña, desde Gestionar Usuarios. */}
      <BarberoForm
        valoresIniciales={valoresDesdeBarbero(barbero)}
        esRegistro={false}
        textoBoton="Guardar"
        onGuardar={guardar}
        onCancelar={() => navigate('/barberos')}
      />
    </>
  );
}
