import PageHeader from '../../../../shared/components/PageHeader';

import { useNavigate } from 'react-router-dom';
import { registrarCliente } from '../../api/gestionar_clientes/clientesApi';
import ClienteForm from '../../components/gestionar_clientes/ClienteForm';

/** Registra al cliente y vuelve al listado con el mensaje de confirmación. */
export default function ClienteCrearPage() {
  const navigate = useNavigate();
  return <>
    <PageHeader title="Nuevo cliente" />
    <ClienteForm guardar={async (datos) => {
      const respuesta = await registrarCliente(datos);
      navigate('/clientes', { state: { mensaje: respuesta.mensaje } });
    }} cancelar={() => navigate('/clientes')} />
  </>;
}
