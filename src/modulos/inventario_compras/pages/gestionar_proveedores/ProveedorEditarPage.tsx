import { useEffect, useState } from 'react';
import { Alert, Button, LinearProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../../shared/components/PageHeader';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { consultarProveedor, guardarProveedor } from '../../api/gestionar_proveedores/proveedoresApi';
import ProveedorForm from '../../components/gestionar_proveedores/ProveedorForm';
import type { ProveedorRequest } from '../../types/gestionar_proveedores';

const VACIO: ProveedorRequest = { empresa: '', nit: '', nombre: '', telefono: '', correo: '' };

export default function ProveedorEditarPage() {
  const { id } = useParams();
  // Remonta el formulario si se navega directamente entre dos proveedores o hacia el alta.
  return <EditorProveedor key={id ?? 'nuevo'} id={id} />;
}

function EditorProveedor({ id }: { id?: string }) {
  const navigate = useNavigate();
  const [inicial, setInicial] = useState<ProveedorRequest | null>(id === undefined ? VACIO : null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id === undefined) return;
    let vigente = true;
    if (!/^[1-9][0-9]*$/.test(id)) {
      Promise.resolve().then(() => { if (vigente) setError('Proveedor no encontrado'); });
    } else {
      consultarProveedor(Number(id)).then((p) => {
        if (vigente) setInicial({ empresa: p.empresa, nit: p.nit, nombre: p.nombre ?? '', telefono: p.telefono ?? '', correo: p.correo ?? '' });
      }).catch((err) => { if (vigente) setError(obtenerError(err).mensaje); });
    }
    return () => { vigente = false; };
  }, [id]);

  async function guardar(datos: ProveedorRequest) {
    const resultado = await guardarProveedor(datos, id === undefined ? undefined : Number(id));
    navigate('/proveedores', { state: { mensaje: resultado.mensaje } });
  }

  return <>
    <PageHeader title={id === undefined ? 'Nuevo proveedor' : 'Editar proveedor'} description="Información de la empresa y sus datos de contacto." />
    {error ? <Alert severity="error" action={<Button onClick={() => navigate('/proveedores')}>Volver</Button>}>{error}</Alert>
      : inicial ? <ProveedorForm inicial={inicial} onGuardar={guardar} onCancelar={() => navigate('/proveedores')} /> : <LinearProgress />}
  </>;
}
