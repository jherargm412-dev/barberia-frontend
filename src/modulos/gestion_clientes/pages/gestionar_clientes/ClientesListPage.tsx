import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import PageHeader from '../../../../shared/components/PageHeader';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { useAuth } from '../../../seguridad_usuarios';
import { activarCliente, desactivarCliente, listarClientes } from '../../api/gestionar_clientes/clientesApi';
import { PERMISOS_CLIENTES } from '../../constants/gestionar_clientes';
import type { Cliente, FiltrosClientes } from '../../types/gestionar_clientes';

/** Lista, filtra y ofrece las acciones permitidas para cada cliente. */
export default function ClientesListPage() {
  const navigate = useNavigate();
  const ubicacion = useLocation();
  const { tienePermiso } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState<boolean | ''>('');
  const [filtros, setFiltros] = useState<FiltrosClientes>({ q: '', activo: '', page: 0, size: 10 });
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState((ubicacion.state as { mensaje?: string } | null)?.mensaje ?? '');
  // Cliente al que se le cambiará el estado: si está activo se desactiva y si no, se activa.
  const [porCambiar, setPorCambiar] = useState<Cliente | null>(null);
  const [procesando, setProcesando] = useState(false);

  /** Actualiza el listado cuando cambian los filtros o la página. */
  useEffect(() => {
    let vigente = true;
    listarClientes(filtros).then((pagina) => {
      if (vigente) { setClientes(pagina.contenido); setTotal(pagina.totalElementos); }
    }).catch((err) => { if (vigente) setError(obtenerError(err).mensaje); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [filtros]);

  function actualizar(nuevos: Partial<FiltrosClientes>) {
    setFiltros((actual) => ({ ...actual, ...nuevos }));
    setCargando(true);
    setError('');
  }
  function buscar(evento: FormEvent) {
    evento.preventDefault();
    actualizar({ q: busqueda.trim(), activo: estado, page: 0 });
  }
  /** Ejecuta el cambio de estado después de la confirmación. */
  async function confirmarCambioEstado() {
    if (!porCambiar) return;
    setProcesando(true);
    try {
      const respuesta = porCambiar.activo
        ? await desactivarCliente(porCambiar.idCliente)
        : await activarCliente(porCambiar.idCliente);
      setMensaje(respuesta.mensaje);
      actualizar({});
    } catch (err) { setError(obtenerError(err).mensaje); }
    finally { setProcesando(false); setPorCambiar(null); }
  }

  return <>
    <PageHeader title="Clientes" description="Consulta los clientes y administra sus datos y estado."
      action={tienePermiso(PERMISOS_CLIENTES.CREAR) && <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/clientes/nuevo')}>Nuevo cliente</Button>} />
    {/* Los campos y la búsqueda ocupan el ancho disponible en celular. */}
    <Box component="form" onSubmit={buscar} sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap',
      '& > *': { width: { xs: '100%', sm: 'auto' } } }}>
      <TextField label="Nombre o teléfono" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} size="small" />
      <TextField select label="Estado" value={estado === '' ? '' : String(estado)}
        onChange={(e) => setEstado(e.target.value === '' ? '' : e.target.value === 'true')} size="small" sx={{ minWidth: 150 }}>
        <MenuItem value="">Todos</MenuItem><MenuItem value="true">Activos</MenuItem><MenuItem value="false">Inactivos</MenuItem>
      </TextField>
      <Button variant="outlined" type="submit">Buscar</Button>
    </Box>
    {mensaje && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMensaje('')}>{mensaje}</Alert>}
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {cargando && <LinearProgress />}
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 720 }}><TableHead><TableRow>
        <TableCell>Nombre</TableCell><TableCell>Teléfono</TableCell><TableCell>Registro</TableCell><TableCell>Estado</TableCell><TableCell>Acciones</TableCell>
      </TableRow></TableHead><TableBody>
        {!cargando && !error && clientes.length === 0 && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary' }}>No se encontraron clientes</TableCell></TableRow>}
        {clientes.map((cliente) => <TableRow hover key={cliente.idCliente}>
          <TableCell>{cliente.nombre}</TableCell><TableCell>{cliente.telefono || '—'}</TableCell>
          <TableCell>{cliente.fechaRegistro}</TableCell><TableCell><Chip size="small" variant="outlined" label={cliente.activo ? 'Activo' : 'Inactivo'} /></TableCell>
          <TableCell>
            <Button size="small" onClick={() => navigate(`/clientes/${cliente.idCliente}`)}>Consultar</Button>
            {tienePermiso(PERMISOS_CLIENTES.EDITAR) && <Button size="small" onClick={() => navigate(`/clientes/${cliente.idCliente}/editar`)}>Modificar</Button>}
            {tienePermiso(PERMISOS_CLIENTES.EDITAR) && (cliente.activo
              ? <Button size="small" color="error" onClick={() => setPorCambiar(cliente)}>Desactivar</Button>
              : <Button size="small" color="success" onClick={() => setPorCambiar(cliente)}>Activar</Button>)}
          </TableCell>
        </TableRow>)}
      </TableBody></Table>
      <TablePagination component="div" count={total} page={filtros.page} rowsPerPage={filtros.size}
        onPageChange={(_, page) => actualizar({ page })}
        onRowsPerPageChange={(e) => actualizar({ size: Number(e.target.value), page: 0 })}
        rowsPerPageOptions={[10, 20, 50]} labelRowsPerPage="Clientes por página" />
    </TableContainer>
    <ConfirmDialog abierto={porCambiar !== null}
      titulo={porCambiar?.activo ? 'Desactivar cliente' : 'Activar cliente'}
      mensaje={porCambiar?.activo
        ? `¿Desactivar a ${porCambiar?.nombre}? Su historial se conservará.`
        : `¿Activar a ${porCambiar?.nombre}? Volverá a figurar como cliente activo.`}
      textoConfirmar={porCambiar?.activo ? 'Desactivar' : 'Activar'} cargando={procesando}
      onConfirmar={confirmarCambioEstado} onCancelar={() => setPorCambiar(null)} />
  </>;
}
