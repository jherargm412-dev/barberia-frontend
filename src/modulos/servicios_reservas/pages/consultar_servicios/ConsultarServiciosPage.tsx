import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ANCHO_PUBLICO } from '../../../../shared/styles/publico';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { useAuth } from '../../../seguridad_usuarios';
import { listarCatalogo } from '../../api/consultar_servicios/catalogoApi';
import BarraPublica from '../../components/consultar_servicios/BarraPublica';
import EncabezadoCatalogo from '../../components/consultar_servicios/EncabezadoCatalogo';
import FiltrosCatalogoPublico from '../../components/consultar_servicios/FiltrosCatalogoPublico';
import PiePublico from '../../components/consultar_servicios/PiePublico';
import ServicioCard from '../../components/consultar_servicios/ServicioCard';
import type { FiltrosCatalogo, ServicioCatalogo } from '../../types/consultar_servicios';
import { rutaParaReservar } from '../../utils/consultar_servicios/reservar';

const SIN_FILTROS: FiltrosCatalogo = { q: '', precioMin: '', precioMax: '' };

/**
 * CU13: Consultar Servicios. Vista pública (con o sin sesión) del catálogo de servicios activos:
 * 1) tarjetas con nombre, descripción y precio; 2) búsqueda por texto y rango de precio;
 * 3) "Reservar" lleva a CU12 (cliente) o CU11 (recepción); sin sesión, a reservar sin cuenta.
 */
export default function ConsultarServiciosPage() {
  const navigate = useNavigate();
  const { usuario, tienePermiso } = useAuth();

  // Lo que se escribe en el formulario y lo último que se consultó (se aplica con "Buscar").
  const [escritos, setEscritos] = useState<FiltrosCatalogo>(SIN_FILTROS);
  const [filtros, setFiltros] = useState<FiltrosCatalogo>(SIN_FILTROS);
  const [servicios, setServicios] = useState<ServicioCatalogo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;
    listarCatalogo(filtros)
      .then((data) => vigente && setServicios(data))
      .catch((err) => {
        if (!vigente) return;
        // Un filtro inválido (p. ej. mínimo mayor que el máximo) trae su campo; si no, error de conexión.
        const { mensaje, campos } = obtenerError(err);
        setError(
          Object.keys(campos).length > 0 ? mensaje : 'No se pudo cargar el catálogo de servicios. Intente nuevamente.',
        );
        setServicios([]);
      })
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [filtros]);

  function aplicar(nuevos: FiltrosCatalogo) {
    setCargando(true);
    setError('');
    setFiltros({ ...nuevos });
  }

  function limpiar() {
    setEscritos(SIN_FILTROS);
    aplicar(SIN_FILTROS);
  }

  /**
   * Paso 3: a CU12 si es cliente, a CU11 si es recepción. Sin sesión se reserva sin cuenta (nombre y teléfono);
   * esa pantalla también ofrece iniciar sesión a quien sí tiene cuenta.
   */
  function reservar(servicio: ServicioCatalogo) {
    if (!usuario) {
      navigate(`/reservar-sin-cuenta?servicio=${servicio.idServicio}`);
      return;
    }
    const destino = rutaParaReservar(servicio.idServicio, tienePermiso);
    if (destino) navigate(destino);
  }

  const hayFiltros = filtros.q.trim() !== '' || filtros.precioMin !== '' || filtros.precioMax !== '';
  // Sin sesión se ofrece igual (lleva a reservar sin cuenta); con sesión, solo a quien puede agendar.
  const puedeReservar = !usuario || rutaParaReservar(0, tienePermiso) !== null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <BarraPublica />
      <EncabezadoCatalogo activo="servicios" />

      <Box component="main" sx={{ width: '100%', boxSizing: 'border-box', maxWidth: ANCHO_PUBLICO, mx: 'auto',
        px: { xs: 2, sm: 4 }, pt: 4, pb: { xs: 7, md: 12 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Paso 2: búsqueda por texto y rango de precio */}
        <FiltrosCatalogoPublico
          valores={escritos}
          onCambiar={setEscritos}
          onBuscar={() => aplicar(escritos)}
          onLimpiar={hayFiltros ? limpiar : undefined}
          etiquetaBusqueda="Buscar servicio"
        />

        {!cargando && !error && servicios.length > 0 && (
          <Typography color="text.secondary" sx={{ fontSize: 14 }}>
            <Box component="strong" sx={{ color: 'text.primary' }}>
              {servicios.length} {servicios.length === 1 ? 'servicio' : 'servicios'}
            </Box>{' '}· del más caro al más barato
          </Typography>
        )}

        {/* Error de conexión o de filtros (p. ej. mínimo mayor que el máximo) */}
        {!cargando && error && <Alert severity="error">{error}</Alert>}

        {/* Flujo 3a: sin servicios disponibles / sin resultados de la búsqueda */}
        {!cargando && !error && servicios.length === 0 && (
          <Alert severity="info">
            {hayFiltros ? 'Ningún servicio coincide con la búsqueda.' : 'No hay servicios disponibles por el momento.'}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' } }}>
          {cargando && [0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={210} sx={{ borderRadius: '22px' }} />)}
          {!cargando && !error && servicios.map((servicio) => (
            <ServicioCard key={servicio.idServicio} servicio={servicio} onReservar={puedeReservar ? reservar : undefined} />
          ))}
        </Box>
      </Box>

      <PiePublico />
    </Box>
  );
}
