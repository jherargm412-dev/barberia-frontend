import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { ANCHO_PUBLICO } from '../../../../shared/styles/publico';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { BarraPublica, EncabezadoCatalogo, FiltrosCatalogoPublico, PiePublico } from '../../../servicios_reservas';
import { listarCatalogoProductos } from '../../api/consultar_catalogo_productos/catalogoProductosApi';
import ProductoCard from '../../components/consultar_catalogo_productos/ProductoCard';
import type { FiltrosCatalogoProductos, ProductoCatalogo } from '../../types/consultar_catalogo_productos';

const SIN_FILTROS: FiltrosCatalogoProductos = { q: '', precioMin: '', precioMax: '' };

/**
 * CU23: Consultar Catálogo de Productos. Vista pública (con o sin sesión) de los productos de venta activos:
 * 1) tarjetas con imagen, nombre, descripción, precio y disponibilidad; 2) búsqueda por texto y rango de precio.
 */
export default function ConsultarProductosPage() {
  // Lo que se escribe en el formulario y lo último que se consultó (se aplica con "Buscar").
  const [escritos, setEscritos] = useState<FiltrosCatalogoProductos>(SIN_FILTROS);
  const [filtros, setFiltros] = useState<FiltrosCatalogoProductos>(SIN_FILTROS);
  const [productos, setProductos] = useState<ProductoCatalogo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;
    listarCatalogoProductos(filtros)
      .then((data) => vigente && setProductos(data))
      .catch((err) => {
        if (!vigente) return;
        // Un filtro inválido (p. ej. mínimo mayor que el máximo) trae su campo; si no, error de conexión.
        const { mensaje, campos } = obtenerError(err);
        setError(
          Object.keys(campos).length > 0 ? mensaje : 'No se pudo cargar el catálogo de productos. Intente nuevamente.',
        );
        setProductos([]);
      })
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [filtros]);

  function aplicar(nuevos: FiltrosCatalogoProductos) {
    setCargando(true);
    setError('');
    setFiltros({ ...nuevos });
  }

  function limpiar() {
    setEscritos(SIN_FILTROS);
    aplicar(SIN_FILTROS);
  }

  const hayFiltros = filtros.q.trim() !== '' || filtros.precioMin !== '' || filtros.precioMax !== '';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <BarraPublica />
      <EncabezadoCatalogo activo="productos" />

      <Box component="main" sx={{ width: '100%', boxSizing: 'border-box', maxWidth: ANCHO_PUBLICO, mx: 'auto',
        px: { xs: 2, sm: 4 }, pt: 4, pb: { xs: 7, md: 12 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Paso 2: búsqueda por texto y rango de precio */}
        <FiltrosCatalogoPublico
          valores={escritos}
          onCambiar={setEscritos}
          onBuscar={() => aplicar(escritos)}
          onLimpiar={hayFiltros ? limpiar : undefined}
          etiquetaBusqueda="Buscar producto"
        />

        {!cargando && !error && productos.length > 0 && (
          <Typography color="text.secondary" sx={{ fontSize: 14 }}>
            <Box component="strong" sx={{ color: 'text.primary' }}>
              {productos.length} {productos.length === 1 ? 'producto' : 'productos'}
            </Box>{' '}· del más caro al más barato
          </Typography>
        )}

        {!cargando && error && <Alert severity="error">{error}</Alert>}

        {!cargando && !error && productos.length === 0 && (
          <Alert severity="info">
            {hayFiltros ? 'Ningún producto coincide con la búsqueda.' : 'No hay productos disponibles por el momento.'}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' } }}>
          {cargando && [0, 1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={320} sx={{ borderRadius: '22px' }} />)}
          {!cargando && !error && productos.map((producto) => <ProductoCard key={producto.idProducto} producto={producto} />)}
        </Box>

        {!cargando && !error && productos.length > 0 && (
          <Typography color="text.secondary" sx={{ fontSize: 14, textAlign: 'center', mt: 2 }}>
            Los productos se venden en la barbería. Pregunta por ellos en tu próxima cita.
          </Typography>
        )}
      </Box>

      <PiePublico />
    </Box>
  );
}
