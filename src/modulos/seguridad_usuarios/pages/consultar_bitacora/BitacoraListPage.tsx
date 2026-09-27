import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { listarBitacora, obtenerOpcionesFiltro } from '../../api/consultar_bitacora/bitacoraApi';
import { listarUsuarios } from '../../api/gestionar_usuarios/usuariosApi';
import BitacoraDetalleDialog from '../../components/consultar_bitacora/BitacoraDetalleDialog';
import BitacoraFiltros from '../../components/consultar_bitacora/BitacoraFiltros';
import BitacoraTabla from '../../components/consultar_bitacora/BitacoraTabla';
import { FILTROS_VACIOS } from '../../constants/consultar_bitacora';
import type { BitacoraResumen, FiltrosBitacora, OpcionesFiltroBitacora } from '../../types/consultar_bitacora';
import type { UsuarioResumen } from '../../types/gestionar_usuarios';

interface Consulta {
  filtros: FiltrosBitacora;
  page: number;
  size: number;
}

/** CU05 Consultar Bitácora: listado con filtros (pasos 3–8) y detalle de un registro (9–10). Solo lectura. */
export default function BitacoraListPage() {
  // Paso 3 / 4a: al entrar, sin filtros y desde el más reciente.
  const [consulta, setConsulta] = useState<Consulta>({ filtros: FILTROS_VACIOS, page: 0, size: 20 });
  const [registros, setRegistros] = useState<BitacoraResumen[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  // 7a: "No se encontraron registros" (viene del backend).
  const [mensaje, setMensaje] = useState('');
  // 7b: "No fue posible consultar la bitácora" (viene del backend).
  const [error, setError] = useState('');
  const [opciones, setOpciones] = useState<OpcionesFiltroBitacora>({ acciones: [], tablas: [] });
  const [usuarios, setUsuarios] = useState<UsuarioResumen[]>([]);
  // Registro elegido para ver el detalle (null = diálogo cerrado).
  const [idDetalle, setIdDetalle] = useState<number | null>(null);

  // Opciones de los filtros: se cargan una sola vez. Si fallan, los filtros quedan en "Todos".
  useEffect(() => {
    obtenerOpcionesFiltro().then(setOpciones).catch(() => {});
    // La lista de usuarios sale de CU01 (el Administrador tiene USUARIO_GESTIONAR).
    listarUsuarios({ q: '', estado: '', rol: '', page: 0, size: 100 })
      .then((pagina) => setUsuarios(pagina.contenido))
      .catch(() => {});
  }, []);

  // Pasos 7–8: cada vez que cambian los filtros o la página, volvemos a pedir la lista.
  useEffect(() => {
    listarBitacora(consulta.filtros, consulta.page, consulta.size)
      .then((pagina) => {
        setRegistros(pagina.contenido);
        setTotal(pagina.totalElementos);
        setMensaje(pagina.mensaje ?? '');
      })
      .catch((err) => {
        setRegistros([]);
        setTotal(0);
        setError(obtenerError(err).mensaje);
      })
      .finally(() => setCargando(false));
  }, [consulta]);

  /** Cambia filtros/página y deja listo el estado de "cargando" para el useEffect. */
  function consultar(nueva: Partial<Consulta>) {
    // Siempre es un objeto nuevo, así que el useEffect se vuelve a ejecutar (sirve para "Reintentar").
    setConsulta({ ...consulta, ...nueva });
    setCargando(true);
    setError('');
    setMensaje('');
  }

  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Bitácora
      </Typography>

      {/* Al buscar volvemos a la primera página. */}
      <BitacoraFiltros opciones={opciones} usuarios={usuarios} onBuscar={(filtros) => consultar({ filtros, page: 0 })} />

      {mensaje && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {mensaje}
        </Alert>
      )}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => consultar({})}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      {cargando && <LinearProgress />}

      <BitacoraTabla
        registros={registros}
        total={total}
        pagina={consulta.page}
        tamano={consulta.size}
        onCambiarPagina={(page) => consultar({ page })}
        onCambiarTamano={(size) => consultar({ size, page: 0 })}
        onVerDetalle={setIdDetalle}
      />

      <BitacoraDetalleDialog idBitacora={idDetalle} onCerrar={() => setIdDetalle(null)} />
    </>
  );
}
