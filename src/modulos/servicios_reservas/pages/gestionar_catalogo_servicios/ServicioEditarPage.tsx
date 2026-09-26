import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { consultarServicio, modificarServicio } from '../../api/gestionar_catalogo_servicios/serviciosApi';
import ServicioForm from '../../components/gestionar_catalogo_servicios/ServicioForm';
import EstadoServicioChip from '../../components/gestionar_catalogo_servicios/EstadoServicioChip';
import type { Servicio } from '../../types/gestionar_catalogo_servicios';
import {
  construirRequest,
  valoresDesdeServicio,
  type ServicioFormValores,
} from '../../utils/gestionar_catalogo_servicios/servicioForm';

/** CU08 pasos 5–10: modificar servicio (formulario con los datos actuales). */
export default function ServicioEditarPage() {
  const { id } = useParams(); // viene de la ruta /servicios/:id/editar
  const idServicio = Number(id);
  const navigate = useNavigate();

  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    consultarServicio(idServicio)
      .then(setServicio)
      .catch((err) => setError(obtenerError(err).mensaje));
  }, [idServicio]);

  async function guardar(valores: ServicioFormValores) {
    const respuesta = await modificarServicio(idServicio, construirRequest(valores));
    navigate('/servicios', { state: { mensaje: respuesta.mensaje } });
  }

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!servicio) return <CircularProgress />;

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        Modificar servicio <EstadoServicioChip estado={servicio.estado} />
      </Typography>
      {/* El estado no se cambia aquí: se hace desde el listado (flujo 4a). */}
      <ServicioForm
        valoresIniciales={valoresDesdeServicio(servicio)}
        textoBoton="Guardar"
        onGuardar={guardar}
        onCancelar={() => navigate('/servicios')}
      />
    </>
  );
}
