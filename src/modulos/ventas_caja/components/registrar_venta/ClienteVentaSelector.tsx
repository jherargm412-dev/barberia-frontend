import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import { listarClientes, type Cliente } from '../../../gestion_clientes';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import type { ClienteVenta } from '../../types/registrar_venta';

interface Props {
  cliente: ClienteVenta | null;
  deshabilitado?: boolean;
  error?: string;
  onCambiar: (cliente: ClienteVenta | null) => void;
  onError: (mensaje: string) => void;
}

export default function ClienteVentaSelector({ cliente, deshabilitado = false, error, onCambiar, onError }: Props) {
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [opciones, setOpciones] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    let vigente = true;
    const espera = setTimeout(() => {
      setCargando(true);
      listarClientes({ q: busqueda.trim(), activo: true, page: 0, size: 10 })
        .then((pagina) => { if (vigente) setOpciones(pagina.contenido); })
        .catch((err) => { if (vigente) onError(obtenerError(err).mensaje); })
        .finally(() => { if (vigente) setCargando(false); });
    }, 250);
    return () => { vigente = false; clearTimeout(espera); };
  }, [busqueda, onError]);

  return (
    <Autocomplete
      options={cliente && !opciones.some((opcion) => opcion.idCliente === cliente.idCliente)
        ? [{ ...cliente, fechaRegistro: '', activo: true }, ...opciones] : opciones}
      value={cliente ? { ...cliente, fechaRegistro: '', activo: true } : null}
      inputValue={texto}
      onChange={(_, nuevo) => onCambiar(nuevo ? {
        idCliente: nuevo.idCliente, nombre: nuevo.nombre, telefono: nuevo.telefono,
      } : null)}
      onInputChange={(_, valor, motivo) => {
        setTexto(valor);
        if (motivo === 'input' || motivo === 'clear') setBusqueda(valor);
      }}
      disabled={deshabilitado}
      filterOptions={(lista) => lista}
      getOptionLabel={(opcion) => opcion.telefono ? `${opcion.nombre} · ${opcion.telefono}` : opcion.nombre}
      isOptionEqualToValue={(a, b) => a.idCliente === b.idCliente}
      loading={cargando}
      loadingText="Buscando clientes..."
      noOptionsText="No se encontraron clientes activos"
      renderInput={(params) => (
        <TextField {...params} label="Cliente" required error={!!error}
          helperText={error ?? 'Buscar por nombre o teléfono'} />
      )}
    />
  );
}
