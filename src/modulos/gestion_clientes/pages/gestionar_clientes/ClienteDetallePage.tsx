import PageHeader from '../../../../shared/components/PageHeader';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { consultarCliente } from '../../api/gestionar_clientes/clientesApi';
import type { Cliente } from '../../types/gestionar_clientes';
import { obtenerError } from '../../../../shared/utils/obtenerError';

/** Presenta los datos y el estado actual de un cliente. */
export default function ClienteDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero <= 0) return;
    consultarCliente(numero).then(setCliente).catch((err) => setError(obtenerError(err).mensaje));
  }, [id]);
  if (!Number.isInteger(Number(id)) || Number(id) <= 0) return <Alert severity="error">Cliente no encontrado</Alert>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!cliente) return <CircularProgress />;
  return <>
    <PageHeader title="Detalle del cliente" />
    <Typography>Nombre: {cliente.nombre}</Typography>
    <Typography>Teléfono: {cliente.telefono || 'No registrado'}</Typography>
    <Typography>Fecha de registro: {cliente.fechaRegistro}</Typography>
    <Typography>Estado: {cliente.activo ? 'Activo' : 'Inactivo'}</Typography>
    <Button sx={{ mt: 2 }} onClick={() => navigate('/clientes')}>Volver</Button>
  </>;
}
