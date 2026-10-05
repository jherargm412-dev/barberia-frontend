import PageHeader from '../../../../shared/components/PageHeader';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { consultarCliente, modificarCliente } from '../../api/gestionar_clientes/clientesApi';
import ClienteForm from '../../components/gestionar_clientes/ClienteForm';
import type { Cliente } from '../../types/gestionar_clientes';
import { obtenerError } from '../../../../shared/utils/obtenerError';

/** Carga los datos actuales antes de mostrar el formulario de modificación. */
export default function ClienteEditarPage() {
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
    <PageHeader title="Modificar cliente" />
    <ClienteForm inicial={{ nombre: cliente.nombre, telefono: cliente.telefono }} guardar={async (datos) => {
      const respuesta = await modificarCliente(cliente.idCliente, datos);
      navigate('/clientes', { state: { mensaje: respuesta.mensaje } });
    }} cancelar={() => navigate('/clientes')} />
  </>;
}
